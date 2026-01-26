import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

const canonicalPatterns = [
  {
    name: "Binary Search on Answer",
    description: "Use binary search to find the optimal answer when the problem has a monotonic property",
  },
  {
    name: "Sliding Window (fixed / variable)",
    description: "Maintain a window of elements and slide it across the array to solve subarray/substring problems",
  },
  {
    name: "Two pointers (invariant-based)",
    description: "Use two pointers moving from different ends or at different speeds to solve array/string problems",
  },
  {
    name: "Monotonic Stack",
    description: "Use a stack that maintains elements in monotonic order to solve next/previous greater/smaller element problems",
  },
  {
    name: "Tree DFS (state passing)",
    description: "Depth-first search on trees by passing state down through recursive calls",
  },
  {
    name: "Tree DFS (return-based)",
    description: "Depth-first search on trees by returning values up from recursive calls",
  },
  {
    name: "BFS with levels",
    description: "Breadth-first search that processes nodes level by level, useful for level-order traversal",
  },
  {
    name: "Topological Sort",
    description: "Order nodes in a directed acyclic graph such that for every edge u→v, u comes before v",
  },
  {
    name: "Union-Find",
    description: "Data structure for efficiently tracking disjoint sets and performing union/find operations",
  },
  {
    name: "DP 1D (prefix)",
    description: "Dynamic programming with one-dimensional state, often using prefix sums or cumulative results",
  },
  {
    name: "DP 2D (grid)",
    description: "Dynamic programming on a 2D grid, solving problems by building up solutions cell by cell",
  },
  {
    name: "DP on subsequences",
    description: "Dynamic programming problems involving subsequences (not necessarily contiguous)",
  },
  {
    name: "Bitmask DP",
    description: "Dynamic programming using bitmasks to represent subsets or states efficiently",
  },
  {
    name: "Greedy + sorting",
    description: "Greedy algorithms that require sorting the input first to make optimal choices",
  },
  {
    name: "Interval merging",
    description: "Problems involving merging, overlapping, or scheduling intervals",
  },
  {
    name: "Heap (k-way / top-k)",
    description: "Use heaps to find k largest/smallest elements or merge k sorted lists",
  },
  {
    name: "Trie",
    description: "Prefix tree data structure for efficient string searching, prefix matching, and autocomplete",
  },
  {
    name: "Backtracking with pruning",
    description: "Systematic search with backtracking, using pruning to eliminate invalid paths early",
  },
  {
    name: "Graph shortest path",
    description: "Algorithms to find shortest paths in graphs (Dijkstra, Bellman-Ford, Floyd-Warshall)",
  },
  {
    name: "Graph cycle detection",
    description: "Detect cycles in directed or undirected graphs using DFS or Union-Find",
  },
  {
    name: "Prefix sums",
    description: "Precompute prefix sums to answer range sum queries in O(1) time",
  },
  {
    name: "Difference array",
    description: "Use difference arrays to efficiently update ranges and compute final array values",
  },
  {
    name: "Sweep line",
    description: "Process events in sorted order to solve interval, geometric, or scheduling problems",
  },
  {
    name: "Meet-in-the-middle",
    description: "Split the problem into two halves, solve each independently, then combine results",
  },
  {
    name: "Math / combinatorics",
    description: "Problems requiring mathematical insights, number theory, or combinatorial reasoning",
  },
];

async function main() {
  console.log("Seeding canonical patterns...");

  for (const pattern of canonicalPatterns) {
    await prisma.canonicalPattern.upsert({
      where: { name: pattern.name },
      update: {},
      create: pattern,
    });
    console.log(`✓ Seeded: ${pattern.name}`);
  }

  console.log(`\n✅ Successfully seeded ${canonicalPatterns.length} canonical patterns!`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
