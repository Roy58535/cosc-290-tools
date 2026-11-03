# Permutations, Swaps, and Fixed Points

A lightweight, browser-based tool for exploring permutations and their relationship to swaps, cycles, and fixed points. No installation or internet connection is required.

## Permutation Graph

- Displays every permutation of `[1, 2, …, n]`, with `n = 4` by default and support for `n = 1–6`.
- Connects permutations that differ by swapping any two positions.
- Arranges nodes into layers by their minimum swap distance from identity.
- Highlights fixed-point-free (FPF) permutations with a different color for each layer; all non-FPF nodes share one color.
- Supports zooming, panning, and selecting nodes to highlight their neighbors.

## Cycle Explorer

- Accepts custom permutations of up to 8 elements.
- Illustrates cycles using directed arrows from positions to values.
- Identifies fixed points as single-element cycles and explains their connection to FPF permutations.
- Demonstrates a shortest swap sequence from identity to the selected permutation.
- Explains the formula: **minimum swaps = number of elements − number of cycles**.

## Usage

Open `index.html` for the graph or `cycles.html` for the cycle explorer.
