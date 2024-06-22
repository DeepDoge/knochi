export namespace Database {
	export type Fields = Record<string, unknown>;

	type ModelKeyParameters_internal<T extends Fields> = { keyPath?: keyof T | (keyof T)[]; autoIncrement?: boolean };
	export type ModelKeyParameters<T extends Fields> = Omit<
		IDBObjectStoreParameters,
		keyof ModelKeyParameters_internal<T>
	> &
		ModelKeyParameters_internal<T>;

	export type ModalIndexParameters<T extends Fields> = {
		field: keyof T | (keyof T)[];
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
			parser<TFields extends Fields>(parser: (fields: unknown) => TFields) {
				return {
					key<TParams extends ModelKeyParameters<TFields>>(parameters: TParams) {
						function indexBuilder<const TIndexes extends readonly ModalIndexParameters<TFields>[]>(
							indexes: TIndexes,
						) {
							return {
								index<TIndex extends ModalIndexParameters<TFields>>(newIndex: TIndex) {
									return indexBuilder([...indexes, newIndex]);
								},
								build(): Model<TFields, TParams, TIndexes> {
									return { parser, parameters: parameters as TParams, indexes };
								},
							};
						}
						return indexBuilder([]);
					},
				};
			},
		};
	}

	export function create(name: string) {
		function versionBuilder<
			const TVersions extends readonly {
				version: number;
				models: Record<string, Model>;
				customMigration: { (tx: IDBTransaction, done: () => void): unknown };
			}[],
		>(versions: TVersions) {
			return {
				version<Models extends Record<string, Model>>(
					version: number,
					models: Models,
					customMigration: { (tx: IDBTransaction, done: () => void): unknown } = (_, done) => done(),
				) {
					return versionBuilder([...versions, { version, models, customMigration }]);
				},
				build() {
					const sortedVersions = versions.toSorted((a, b) => a.version - b.version);
					const lastVersion = sortedVersions.at(-1);
					if (!lastVersion) {
						throw new Error("No last version");
					}

					const openRequest = indexedDB.open(name, lastVersion.version);
					openRequest.onupgradeneeded = (event) => {
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

								version.customMigration(tx, () => {
									// Validate data against parser before committing
									const cursorRequest = store.openCursor();
									cursorRequest.onsuccess = (e) => {
										const cursor = cursorRequest.result;
										if (cursor) {
											const data = cursor.value;
											try {
												model.parser(data); // This will throw if data does not match parser schema
												cursor.continue();
											} catch (error) {
												console.error(
													`Validation error in ${modelName} store: `,
													String(error),
												);
												throw error;
											}
										}
									};
								});
							}
						}

						// Commit transaction after all validations
						tx.oncomplete = () => {
							console.log(`Migration to version ${lastVersion.version} complete`);
						};
						tx.onerror = (e) => {
							console.error(`Migration to version ${lastVersion.version} failed`, tx.error);
						};
					};

					openRequest.onsuccess = (event) => {
						const db = openRequest.result;
						console.log(`Database ${name} opened successfully`);
						// Handle success logic here
					};

					openRequest.onerror = (event) => {
						console.error(`Database ${name} failed to open`, openRequest.error);
						// Handle error logic here
					};
				},
			};
		}

		return versionBuilder([]);
	}
}
