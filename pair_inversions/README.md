# Permutation inversions

Open `index.html` directly in a browser. No installation, server, network, or build step is needed.

Choose n from 2 through 7. All n! permutations appear in n starting-number groups, each with a permutation column and an X column, over (n−1)! rows. Permutations increase lexicographically across each row and down each group.

An inversion is a pair of positions i < j with a[i] > a[j]. Colors identify equal inversion counts; click a legend count to highlight its strips, or click a permutation to list its inverted pairs. A common tail rank pattern in each row gives X = tail inversions + starting number − 1. Equal-count strips form diagonal fragments, with resets from the lexicographic ordering of the tails.

Three arrangement tabs are available: the original lexicographic order; individual permutations sorted by tail inversion count (lexicographic ties); and equal-height grouped rows indexed by tail inversion count. Grouped cells contain scrollable permutation lists so differing multiplicities do not distort the straight diagonal bands. The size, coloring, and count highlight are shared across views.
