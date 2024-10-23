// TODO: This needs a refactor, but I only care about making it work. At this time.

export namespace DB {
	export namespace IDB {
		export function toPromise<T = unknown>(request: IDBRequest<T>): Promise<T> {
			return new Promise((resolve, reject) => {
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
		}

		export async function* toIterPromise<T extends IDBCursorWithValue | null>(request: IDBRequest<T>) {
			const cursor = await toPromise(request);
			if (!cursor) return;
			yield cursor;
			cursor.continue();
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export type Fields = Record<string, any>;

	export type ModelKeyParameters<
		T extends Fields,
		Keys extends string = Extract<keyof { [K in keyof T as T[K] extends IDBValidKey ? K : never]: 0 }, string>,
	> = Omit<IDBObjectStoreParameters, Keys> & {
		keyPath?: Keys | Keys[];
	};

	export type ModalIndexParameters<
		T extends Fields,
		Keys extends string = Extract<keyof { [K in keyof T as T[K] extends IDBValidKey ? K : never]: 0 }, string>,
	> = {
		field: Keys | Keys[];
		options: IDBIndexParameters;
	};

	export type Model<
		TFields extends Fields = Fields,
		TParams extends ModelKeyParameters<TFields> = ModelKeyParameters<TFields>,
		TIndexes extends readonly ModalIndexParameters<TFields>[] = readonly ModalIndexParameters<TFields>[],
	> = {
		parser(fields: unknown): TFields;
		parameters: TParams;
		indexes: TIndexes;
	};

	export type ModelBuilder = ReturnType<typeof ModelBuilder>;
	export function ModelBuilder() {
		return {
			parser<TFields extends Fields>(parser: (fields: TFields) => TFields) {
				return {
					key<const TParams extends ModelKeyParameters<TFields>>(parameters: TParams) {
						function innerBuilder<const TIndexes extends readonly ModalIndexParameters<TFields>[]>(
							indexes: TIndexes,
						) {
							return {
								index<const TIndex extends ModalIndexParameters<TFields>>(newIndex: TIndex) {
									return innerBuilder([...indexes, newIndex]);
								},
								build(): Model<TFields, TParams, TIndexes> {
									return { parser, parameters: parameters as TParams, indexes };
								},
							};
						}
						return innerBuilder([]);
					},
				};
			},
		};
	}

	type Version = {
		version: number;
		models: Record<string, Model>;
		customMigration: { (tx: IDBTransaction): unknown };
	};

	export function create(databaseName: string) {
		function versionBuilder<const TVersions extends readonly Version[]>(versions: TVersions) {
			return {
				version<Models extends Record<string, Model>>(
					version: number,
					models: Models,
					customMigration: { (tx: IDBTransaction): unknown } = async () => {},
				) {
					return versionBuilder([...versions, { version, models, customMigration }]);
				},
				build() {
					const sortedVersions = versions.toSorted((a, b) => a.version - b.version);
					const lastVersion = sortedVersions.at(-1);
					if (!lastVersion) {
						throw new Error("No last version");
					}

					const openRequest = indexedDB.open(databaseName, lastVersion.version);
					openRequest.onupgradeneeded = async (event) => {
						const db = openRequest.result;
						const tx = openRequest.transaction;
						if (!tx) {
							throw new Error("No transaction");
						}

						for (const version of sortedVersions) {
							if (event.oldVersion >= version.version) continue;

							console.log(`Upgrading to version ${version.version}`);
							for (const [modelName, model] of Object.entries(version.models)) {
								console.log(`> Applying model ${modelName}`);

								const store =
									db.objectStoreNames.contains(modelName) ?
										tx.objectStore(modelName)
									:	db.createObjectStore(modelName, model.parameters);

								// Handle index updates and deletions
								const existingIndexes = Array.from(store.indexNames);
								const newIndexes = model.indexes.map((index) =>
									Array.isArray(index.field) ? index.field.join("_") : (index.field as string),
								);

								// Delete obsolete indexes
								for (const indexName of existingIndexes) {
									if (!newIndexes.includes(indexName)) {
										store.deleteIndex(indexName);
									}
								}

								// Create or update indexes
								for (const index of model.indexes) {
									const indexName =
										Array.isArray(index.field) ? index.field.join("_") : (index.field as string);
									if (!store.indexNames.contains(indexName)) {
										store.createIndex(indexName, index.field, index.options);
									} else {
										// Update existing index if needed (not directly supported, so we recreate)
										store.deleteIndex(indexName);
										store.createIndex(indexName, index.field, index.options);
									}
								}

								await version.customMigration(tx);

								// Validate data against parser before committing
								const cursorRequest = store.openCursor();
								for await (const cursor of IDB.toIterPromise(cursorRequest)) {
									try {
										model.parser(cursor.value); // This will throw if data does not match parser schema
									} catch (error) {
										console.error(`Validation error in ${modelName} store: `, String(error));
										throw error;
									}
								}
							}
						}

						// Commit transaction after all validations
						tx.oncomplete = () => {
							console.log(`Migration to version ${lastVersion.version} complete`);
						};
						tx.onerror = () => {
							console.error(`Migration to version ${lastVersion.version} failed`, tx.error);
						};
					};

					const promise = IDB.toPromise(openRequest);

					type LastVersion = TVersions extends readonly [...Version[], infer U extends Version] ? U : never;

					return {
						lastVersion: lastVersion as LastVersion,
						add<TModelName extends Extract<keyof LastVersion["models"], string>>(modelName: TModelName) {
							const model = lastVersion.models[modelName];
							if (!model) {
								throw new Error(`Model ${modelName} not found`);
							}
							type Model = LastVersion["models"][TModelName];
							type Values = ReturnType<Model["parser"]>;
							return {
								values(values: Values) {
									model.parser(values);
									return {
										async execute() {
											await promise;
											const db = await IDB.toPromise(indexedDB.open(databaseName));
											await IDB.toPromise(
												db
													.transaction(modelName, "readwrite")
													.objectStore(modelName)
													.add(values),
											);
										},
									};
								},
							};
						},
						set<TModelName extends Extract<keyof LastVersion["models"], string>>(modelName: TModelName) {
							const model = lastVersion.models[modelName];
							if (!model) {
								throw new Error(`Model ${modelName} not found`);
							}
							type Model = LastVersion["models"][TModelName];
							type Values = ReturnType<Model["parser"]>;
							type KeyPath = Model["parameters"]["keyPath"];

							type GetValuesOf<
								TFields extends readonly (keyof Values)[],
								R extends readonly unknown[] = readonly [],
							> =
								TFields extends (
									readonly [infer First extends keyof Values, ...infer Rest extends (keyof Values)[]]
								) ?
									GetValuesOf<Rest, readonly [...R, Values[First]]>
								:	R;
							return {
								byKey(
									key: KeyPath extends readonly string[] ? GetValuesOf<KeyPath>
									:	Values[`${KeyPath extends string ? KeyPath : ""}`],
									values: Values,
								) {
									model.parser(values);
									return {
										async execute() {
											await promise;
											const db = await IDB.toPromise(indexedDB.open(databaseName));
											await IDB.toPromise(
												db
													.transaction(modelName, "readwrite")
													.objectStore(modelName)
													.put(values, key as never),
											);
										},
									};
								},
							};
						},
						find<TModelName extends Extract<keyof LastVersion["models"], string>>(modelName: TModelName) {
							const model = lastVersion.models[modelName];
							if (!model) {
								throw new Error(`Model ${modelName} not found`);
							}
							type Model = LastVersion["models"][TModelName];
							type Values = ReturnType<Model["parser"]>;
							type KeyPath = Model["parameters"]["keyPath"];
							type Key =
								KeyPath extends readonly string[] ? GetValuesOf<KeyPath>
								:	Values[`${KeyPath extends string ? KeyPath : ""}`];
							type Indexes = Model["indexes"][number];
							type IndexedField = Indexes["field"];
							type UniqueIndexes = Model["indexes"][number] & { options: { unique: true } };
							type UniqueIndexedField = UniqueIndexes["field"];

							type GetValuesOf<
								TFields extends readonly (keyof Values)[],
								R extends readonly unknown[] = readonly [],
							> =
								TFields extends (
									readonly [
										infer First extends keyof Values,
										...infer Rest extends readonly (keyof Values)[],
									]
								) ?
									GetValuesOf<Rest, readonly [...R, Values[First]]>
								:	R;

							type Operands = "=" | "<" | ">";

							const self = {
								async manyKeys(limit?: number) {
									await promise;
									const db = await IDB.toPromise(indexedDB.open(databaseName));
									const store = db.transaction(modelName, "readonly").objectStore(modelName);
									return (await IDB.toPromise(store.getAllKeys(null, limit))) as Key[];
								},
								async many(limit?: number) {
									await promise;
									const db = await IDB.toPromise(indexedDB.open(databaseName));
									const store = db.transaction(modelName, "readonly").objectStore(modelName);
									return (await IDB.toPromise(store.getAll(null, limit))) as Values[];
								},
								async byIndex<TFieldName extends IndexedField>(
									field: TFieldName,
									operand: Operands,
									value: TFieldName extends readonly string[] ? GetValuesOf<TFieldName>
									:	Values[`${TFieldName extends string ? TFieldName : ""}`],
									limit: number,
								) {
									await promise;
									const db = await IDB.toPromise(indexedDB.open(databaseName));
									const store = db.transaction(modelName, "readonly").objectStore(modelName);
									const index = store.index(Array.isArray(field) ? field.join("_") : field);

									if (operand === "=") {
										const result = await IDB.toPromise(index.getAll(value as never, limit));
										return result as Values[];
									} else if (operand === "<") {
										const result = await IDB.toPromise(
											index.getAll(IDBKeyRange.lowerBound(value as never), limit),
										);
										return result as Values[];
									} else if (operand === ">") {
										const result = await IDB.toPromise(
											index.getAll(IDBKeyRange.upperBound(value as never), limit),
										);
										return result as Values[];
									} else {
										operand satisfies never;
										throw new Error(`Invalid operand: ${operand}`);
									}
								},
								async byUniqueIndex<TFieldName extends UniqueIndexedField>(
									field: TFieldName,
									value: TFieldName extends readonly string[] ? GetValuesOf<TFieldName>
									:	Values[`${TFieldName extends string ? TFieldName : ""}`],
								) {
									return (await self.byIndex(field, "=", value, 1)).at(0) ?? null;
								},
								async byKey(key: Key) {
									await promise;
									const db = await IDB.toPromise(indexedDB.open(databaseName));
									const store = db.transaction(modelName, "readonly").objectStore(modelName);
									const result = await IDB.toPromise(store.get(key as never));

									return result as Values | null;
								},
							};

							return self;
						},
					};
				},
			};
		}

		return versionBuilder([]);
	}
}
