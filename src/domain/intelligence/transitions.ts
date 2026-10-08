/**
 * @file Generic status transition validator.
 * @module domain/intelligence/transitions
 *
 * Every status enum in TradeHub uses the same shape:
 * a map of valid transitions from each state.
 *
 * This file provides one helper that works for all of them.
 */

export type TransitionMap<T extends string> = Record<T, readonly T[]>;

export function canTransition<T extends string>(
  from: T,
  to: T,
  transitions: TransitionMap<T>,
): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition<T extends string>(
  from: T,
  to: T,
  transitions: TransitionMap<T>,
): void {
  if (!canTransition(from, to, transitions)) {
    throw new Error(`Invalid transition: ${from} → ${to}`);
  }
}
