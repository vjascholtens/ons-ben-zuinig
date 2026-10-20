import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateAccountingEntity } from "./accounting-entity";

type EntityRow = { id: string };
type DbResult = { data: EntityRow | null; error: Error | null };

function createSupabaseStub(readResults: DbResult[], insertResult: DbResult) {
  let readIndex = 0;
  const maybeSingle = vi.fn(async () => readResults[readIndex++] ?? { data: null, error: null });
  const single = vi.fn(async () => insertResult);
  const from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({ maybeSingle })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({ single })),
    })),
  }));

  return {
    client: { from } as unknown as SupabaseClient,
    from,
    maybeSingle,
    single,
  };
}

describe("getOrCreateAccountingEntity", () => {
  it("returns an existing accounting entity without inserting", async () => {
    const stub = createSupabaseStub(
      [{ data: { id: "entity-existing" }, error: null }],
      { data: null, error: new Error("should not insert") },
    );

    await expect(getOrCreateAccountingEntity(stub.client, "user-1")).resolves.toBe("entity-existing");
    expect(stub.single).not.toHaveBeenCalled();
  });

  it("creates an entity when the user does not have one yet", async () => {
    const stub = createSupabaseStub(
      [{ data: null, error: null }],
      { data: { id: "entity-created" }, error: null },
    );

    await expect(getOrCreateAccountingEntity(stub.client, "user-1")).resolves.toBe("entity-created");
    expect(stub.single).toHaveBeenCalledOnce();
  });

  it("recovers when another concurrent request wins the unique owner insert", async () => {
    const stub = createSupabaseStub(
      [
        { data: null, error: null },
        { data: { id: "entity-from-other-request" }, error: null },
      ],
      { data: null, error: new Error("duplicate key value violates unique constraint") },
    );

    await expect(getOrCreateAccountingEntity(stub.client, "user-1")).resolves.toBe("entity-from-other-request");
    expect(stub.maybeSingle).toHaveBeenCalledTimes(2);
  });

  it("returns null when insert fails and no concurrent entity exists", async () => {
    const stub = createSupabaseStub(
      [
        { data: null, error: null },
        { data: null, error: null },
      ],
      { data: null, error: new Error("database unavailable") },
    );

    await expect(getOrCreateAccountingEntity(stub.client, "user-1")).resolves.toBeNull();
  });

  it("returns null when the initial entity lookup fails", async () => {
    const stub = createSupabaseStub(
      [{ data: null, error: new Error("database unavailable") }],
      { data: null, error: null },
    );

    await expect(getOrCreateAccountingEntity(stub.client, "user-1")).resolves.toBeNull();
    expect(stub.single).not.toHaveBeenCalled();
  });
});
