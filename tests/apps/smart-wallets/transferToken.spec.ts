import { Wallet } from "ethers";
import { TransferToken } from "@scripts/smartWalletsTransferTokenTesting";

// The timeout is set to 5 minutes. While Jest's default
// timeout is 5 seconds, transaction require additional time.
const timeout = 300000;

describe('Transfer Token', () => {
  let privateKey1: string;
  let privateKey2: string;
  let address1: string;
  let address2: string;

  beforeEach(async () => {
    privateKey1 = process.env.PRIVATE_KEY_ACCOUNT_1;
    privateKey2 = process.env.PRIVATE_KEY_ACCOUNT_2;

    const wallet1 = new Wallet(privateKey1);
    const wallet2 = new Wallet(privateKey2);

    [address1, address2] = await Promise.all([
      wallet1.getAddress(),
      wallet2.getAddress(),
    ]);
  });

  describe('Account Abstraction', () => {
    test('should successfully transfer token from account 1 to account 2', async () => {
      const transferToken = new TransferToken(privateKey1, address2);
      await expect(transferToken.accountAbstraction()).resolves.toBeDefined();
    }, timeout);

    test('should successfully transfer token from account 2 to account 1', async () => {
      const transferToken = new TransferToken(privateKey2, address1);
      await expect(transferToken.accountAbstraction()).resolves.toBeDefined();
    }, timeout);

    test('should fail to transfer token', async () => {
      const transferToken = new TransferToken("invalidPrivateKey", "invalidAddress");
      await expect(transferToken.accountAbstraction()).rejects.toThrow();
    }, timeout);
  })

  describe('Legacy', () => {
    test('should successfully transfer token from account 1 to account 2', async () => {
      const transferToken = new TransferToken(privateKey1, address2);
      await expect(transferToken.legacy()).resolves.toBeDefined();
    }, timeout);

    test('should successfully transfer token from account 2 to account 1', async () => {
      const transferToken = new TransferToken(privateKey2, address1);
      await expect(transferToken.legacy()).resolves.toBeDefined();
    }, timeout);

    test('should fail to transfer token', async () => {
      const transferToken = new TransferToken("invalidPrivateKey", "invalidAddress");
      await expect(transferToken.legacy()).rejects.toThrow();
    }, timeout);
  })
});
