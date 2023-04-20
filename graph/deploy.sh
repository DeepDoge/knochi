export GRAPH_VERSION_LABEL=dev-$(date +%s)

graph deploy --studio --network=mumbai --version-label=$GRAPH_VERSION_LABEL dforum-mumbai && \
graph deploy --studio --network=sepolia --version-label=$GRAPH_VERSION_LABEL dforum-sepolia && \
echo '{"versionLabel":"'${GRAPH_VERSION_LABEL}'"}' > version-label.json
