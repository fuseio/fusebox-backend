import { UserOpParser, EventProps } from "../../../libs/common/src/utils/user-op-parser"
import { UserOperationBuilder } from "userop"
// import { ERC20_CALLDATA, USER_OP_EVENT_TOPIC_0, USER_OP_EVENT_TOPIC_1, USER_OP_EVENT_TOPIC_2, USER_OP_EVENT_TOPIC_3, USER_OP_EVENT_TOPIC_DATA } from "./constants"


export const ERC20_CALLDATA = '0xb61d27f6000000000000000000000000b1232fd89d027e4b949ced570609e8ad0e18811e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000cc95e80da76bd41507b99d9b977dc3062bcf64300000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000'

export const USER_OP_EVENT_TOPIC_0 = '0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f'
export const USER_OP_EVENT_TOPIC_1 = '0x06e70add5d953bdf6e853950651b985860291addd55abadd755ddefee1fd78d6'
export const USER_OP_EVENT_TOPIC_2 = '0x0000000000000000000000006d49a5cb8568cf81c8227394920af0df0fe50a49'
export const USER_OP_EVENT_TOPIC_3 = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const USER_OP_EVENT_TOPIC_DATA = '0x0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000041b312b42fb000000000000000000000000000000000000000000000000000000000000018f8b'

import { assert } from "chai"


describe("UserOpParser Tests", () => {

  let parser, builder
  beforeEach(function () {
    parser = new UserOpParser()
    builder = new UserOperationBuilder()
  })

  it("should parse userOp calldata", async () => {
    const { walletMethod, targetMethod } = await parser.parseCallData(ERC20_CALLDATA)
    assert(walletMethod.decoded[0], '0xb1232fD89d027e4B949cED570609e8aD0e18811e')
    assert(walletMethod.fragment.name, 'execute')

    assert(targetMethod.decoded[0], '0xcc95E80DA76bd41507b99d9b977Dc3062bcf6430')
    assert(targetMethod.fragment.name, 'transfer')
  });

  it("should parse userOp event", async () => {
    const event: EventProps = {
      topics: [
        USER_OP_EVENT_TOPIC_0,
        USER_OP_EVENT_TOPIC_1,
        USER_OP_EVENT_TOPIC_2,
        USER_OP_EVENT_TOPIC_3
      ],
      data: USER_OP_EVENT_TOPIC_DATA
    }
    const parsedEvent = await parser.parseEvent(event)
    assert(parsedEvent.signature, 'UserOperationEvent(bytes32,address,address,uint256,bool,uint256,uint256)')
    console.log(typeof parsedEvent.args)

    // assert(parsedEvent.decoded[0], '0xb1232fD89d027e4B949cED570609e8aD0e18811e')
    // assert(walletMethod.fragment.name, 'execute')

    // assert(targetMethod.decoded[0], '0xcc95E80DA76bd41507b99d9b977Dc3062bcf6430')
    // assert(targetMethod.fragment.name, 'transfer')
  });


});