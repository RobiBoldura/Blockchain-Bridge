module ibt::token {
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::object::{Self, UID};
    use sui::coin::{Self, Coin, TreasuryCap, CoinMetadata};
    use std::option;
    use sui::types;
    use sui::package;
    
    /// One Time Witness for the token
    struct TOKEN has drop {}

    /// The type identifier of IBT coin
    struct IBT has drop {}

    /// Capability that grants permission to mint and burn IBT coins
    struct AdminCap has key { id: UID }

    /// Error codes
    const ENO_ADMIN_CAPABILITY: u64 = 0;

    // Events
    struct MintEvent has copy, drop {
        amount: u64,
        recipient: address
    }

    struct BurnEvent has copy, drop {
        amount: u64,
        burner: address
    }
    
    /// Initialize the IBT coin type with the one-time witness
    fun init(otw: TOKEN, ctx: &mut TxContext) {
        // Verify one-time witness
        assert!(types::is_one_time_witness(&otw), 0);

        // Create the IBT currency with 9 decimals
        let (treasury_cap, metadata) = coin::create_currency(
            otw, 
            9,    // decimals
            b"IBT", // symbol
            b"IBT Token", // name
            b"Cross-chain bridgeable token", // description
            option::none(), // icon url
            ctx
        );

        // Transfer the mint/burn capability to the deployer
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
        
        // Make metadata immutable
        transfer::public_freeze_object(metadata);
    }

    /// Mint new IBT coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<TOKEN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        event::emit(MintEvent { amount, recipient });
        transfer::public_transfer(coin, recipient);
    }

    /// Burn IBT coins
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<TOKEN>,
        coin: Coin<TOKEN>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&coin);
        event::emit(BurnEvent { 
            amount,
            burner: tx_context::sender(ctx)
        });
        coin::burn(treasury_cap, coin);
    }

    /// Merge two coins
    public entry fun merge(coin1: &mut Coin<TOKEN>, coin2: Coin<TOKEN>) {
        coin::join(coin1, coin2);
    }

    /// Split a coin into two coins
    public entry fun split(
        coin: &mut Coin<TOKEN>,
        split_amount: u64,
        ctx: &mut TxContext
    ) {
        let split_coin = coin::split(coin, split_amount, ctx);
        transfer::public_transfer(split_coin, tx_context::sender(ctx));
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(TOKEN {}, ctx)
    }
} 