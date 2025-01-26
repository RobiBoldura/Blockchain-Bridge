module ibt::ibt {
    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// The type identifier of IBT coin
    struct IBT has drop {}

    /// Module initializer is called once on module publish
    fun init(witness: IBT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9, // decimals
            b"IBT", // symbol (exactly "IBT")
            b"IBT", // name (exactly "IBT")
            b"Inter-Blockchain Token", // description
            option::none(), // icon url
            ctx
        );
        // Transfer the treasury cap to the module publisher
        transfer::public_transfer(treasury, tx_context::sender(ctx));
        // Make the metadata public
        transfer::public_freeze_object(metadata);
    }

    /// Mint new IBT coins and return the Coin object
    public fun mint(
        treasury_cap: &mut TreasuryCap<IBT>, 
        amount: u64,
        ctx: &mut TxContext
    ): Coin<IBT> {
        coin::mint(treasury_cap, amount, ctx)
    }

    /// Mint and transfer IBT coins to recipient
    public entry fun mint_and_transfer(
        treasury_cap: &mut TreasuryCap<IBT>, 
        amount: u64, 
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
    }

    /// Burn IBT coins
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<IBT>,
        coin: Coin<IBT>
    ) {
        coin::burn(treasury_cap, coin);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(IBT {}, ctx)
    }
} 