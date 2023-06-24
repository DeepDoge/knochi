export GRAPH_VERSION_LABEL=dev-$(date +%s)

graph codegen

sed -i 's/mapping-mumbai/mapping-mumbai/g' subgraph.yaml && \
graph deploy --studio --network=mumbai --version-label=$GRAPH_VERSION_LABEL dforum-mumbai && \
sed -i 's/mapping-mumbai/mapping-mumbai/g' subgraph.yaml && \

sed -i 's/mapping-mumbai/mapping-sepolia/g' subgraph.yaml && \
graph deploy --studio --network=sepolia --version-label=$GRAPH_VERSION_LABEL dforum-sepolia && \
sed -i 's/mapping-sepolia/mapping-mumbai/g' subgraph.yaml && \

echo '{"versionLabel":"'${GRAPH_VERSION_LABEL}'"}' > version-label.json
