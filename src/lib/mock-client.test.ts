import { describe, expect, it, vi } from "vitest";

describe("mock-client", () => {
  it("verifies MOCK_ADDRESS is a valid Stellar address format", async () => {
    // Dynamically import to ensure fresh or standard load
    const { createMockClient } = await import("./mock-client");
    const client = createMockClient();
    const addressRes = await client.wallet.connect();
    const address = addressRes.data?.address;

    expect(address).toBeDefined();
    expect(address).toMatch(/^G[A-Z2-7]{55}$/);
  });

  it("verifies switchNetwork returns an error for invalid networks", async () => {
    const { createMockClient } = await import("./mock-client");
    const client = createMockClient();

    const res = await client.network.switchNetwork(
      "invalid" as unknown as Parameters<typeof client.network.switchNetwork>[0],
    );
    expect(res.data).toBeNull();
    expect(res.error).toBe("Invalid network: invalid");
  });

  it("verifies two separate imports produce identical MOCK_HISTORY transaction hashes (determinism)", async () => {
    // First import and fetch history
    const mod1 = await import("./mock-client");
    const client1 = mod1.createMockClient();
    const res1 = await client1.transaction.getHistory("address", 1, 10);
    const hashes1 = res1.data?.map(tx => tx.hash);

    // Reset modules and re-import
    vi.resetModules();

    const mod2 = await import("./mock-client");
    const client2 = mod2.createMockClient();
    const res2 = await client2.transaction.getHistory("address", 1, 10);
    const hashes2 = res2.data?.map(tx => tx.hash);

    expect(hashes1).toEqual(hashes2);
  });

  it("verifies getHistory respects the limit parameter", async () => {
    const { createMockClient } = await import("./mock-client");
    const client = createMockClient();
    
    const limit = 3;
    const res = await client.transaction.getHistory("address", 1, limit);
    
    expect(res.data).toBeDefined();
    expect(res.data?.length).toBe(limit);
  });

  it("verifies getHistory returns distinct pages via the page parameter", async () => {
    const { createMockClient } = await import("./mock-client");
    const { MOCK_HISTORY } = await import("./mock-client");
    const client = createMockClient();

    const limit = 2;
    const page1 = await client.transaction.getHistory("address", 1, limit);
    const page2 = await client.transaction.getHistory("address", 2, limit);

    expect(page1.data?.length).toBe(limit);
    expect(page2.data?.length).toBe(limit);
    expect(page1.data?.map((tx) => tx.hash)).not.toEqual(
      page2.data?.map((tx) => tx.hash),
    );
    expect(page1.data?.[0].hash).toBe(MOCK_HISTORY[0].hash);
    expect(page2.data?.[0].hash).toBe(MOCK_HISTORY[limit].hash);
    expect(page1.total).toBe(MOCK_HISTORY.length);
  });

  // Issue #573 — the Soroban screen must be functional against the mock
  // client: invokeContract/simulateContract return real result data (never
  // "Not implemented") and getEvents returns actual events.
  it("verifySoroban invokeContract resolves with result data, not 'Not implemented'", async () => {
    const { createMockClient, MOCK_ADDRESS: mockAddress } = await import("./mock-client");
    const client = createMockClient();

    const res = await client.soroban.invokeContract({
      contractId: "C123",
      method: "transfer",
      args: [],
      sourceAccount: mockAddress,
    });

    expect(res.error).toBeNull();
    expect(res.status).toBe("success");
    expect(res.data).not.toBeNull();
    expect(res.data).not.toBe("Not implemented");
    expect(res.data).toHaveProperty("success", true);
    expect(res.data).toHaveProperty("txHash");
  });

  it("verifySoroban simulateContract resolves with result data", async () => {
    const { createMockClient } = await import("./mock-client");
    const client = createMockClient();

    const res = await client.soroban.simulateContract({
      contractId: "C123",
      method: "balance",
      args: [{ address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWNA" }],
    });

    expect(res.error).toBeNull();
    expect(res.status).toBe("success");
    expect(res.data).not.toBeNull();
  });

  it("verifySoroban getEvents returns event data for a contract", async () => {
    const { createMockClient } = await import("./mock-client");
    const client = createMockClient();

    const res = await client.soroban.getEvents("C123", 10);

    expect(res.error).toBeNull();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data!.length).toBeGreaterThan(0);
  });
});
