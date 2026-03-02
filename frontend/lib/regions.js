// Maps Riot region IDs to their routing cluster for API calls.
// Region (euw1, na1 ...) → Cluster (europe, americas, asia)
// Account and Match endpoints use the cluster, not the region.
export const regionToCluster = {
  euw1: "europe",
  eun1: "europe",
  na1:  "americas",
  br1:  "americas",
  kr:   "asia",
  jp1:  "asia",
};
