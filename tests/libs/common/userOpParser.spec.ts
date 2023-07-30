import { UserOpParser } from "../../../libs/common/src/utils/userOpParser"
import { UserOperationBuilder } from "userop"
import { ERC20_CALLDATA } from "./constants"

import { assert } from "chai"


describe("UserOpParser Tests", () => {

  let parser, builder
  beforeEach(function () {
    parser = new UserOpParser()
    builder = new UserOperationBuilder()
  })

  it("should return 5 when 2 is added to 3", async () => {
    const { walletMethod, targetMethod } = await parser.parseCallData(ERC20_CALLDATA)
    assert(walletMethod.decoded[0], '0xb1232fD89d027e4B949cED570609e8aD0e18811e')
    assert(walletMethod.fragment.name, 'execute')

    assert(targetMethod.decoded[0], '0xcc95E80DA76bd41507b99d9b977Dc3062bcf6430')
    assert(targetMethod.fragment.name, 'transfer')
  });
});