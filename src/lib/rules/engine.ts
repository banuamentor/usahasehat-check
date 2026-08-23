import type { Rule, RuleCondition, RuleGroup, RuleNode, RuleOperator } from "@/types/assessment";

export type RuleContext = Record<string, unknown>;

function isGroup(node: RuleNode): node is RuleGroup {
  return (node as RuleGroup).all !== undefined || (node as RuleGroup).any !== undefined;
}

function resolve(context: RuleContext, field: string): unknown {
  if (field in context) return context[field];
  // dukung dot-path nested (mis. profile.stage bila context bersarang)
  return field.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, context);
}

function compare(actual: unknown, operator: RuleOperator, expected: unknown): boolean {
  switch (operator) {
    case "equals":
      return actual === expected;
    case "not_equals":
      return actual !== expected;
    case "greater_than":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "less_than":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "greater_or_equal":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "less_or_equal":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "in":
      return Array.isArray(expected) && expected.includes(actual as never);
    case "not_in":
      return Array.isArray(expected) && !expected.includes(actual as never);
    case "exists":
      return actual !== undefined && actual !== null;
    default:
      return false;
  }
}

export function evaluateNode(node: RuleNode, context: RuleContext): boolean {
  if (isGroup(node)) {
    if (node.all && node.all.length > 0 && !node.all.every((child) => evaluateNode(child, context))) {
      return false;
    }
    if (node.any && node.any.length > 0 && !node.any.some((child) => evaluateNode(child, context))) {
      return false;
    }
    return true;
  }
  const condition = node as RuleCondition;
  return compare(resolve(context, condition.field), condition.operator, condition.value);
}

export function evaluateRule(rule: Rule | undefined, context: RuleContext): boolean {
  if (!rule) return true;
  return evaluateNode(rule, context);
}
