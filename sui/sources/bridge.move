module bridge::bridge {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use bridge::ibt::{Self, IBT};
    use sui::coin::{Self, TreasuryCap};

    // Events
    struct TokensBridged has copy, drop {
        amount: u64,
        recipient: address,
        eth_sender: vector<u8>
    }

    /// One-time witness for the bridge module
    struct BRIDGE has drop {}

    struct AdminCap has key, store {
        id: UID,
        treasury_cap: TreasuryCap<IBT>
    }

    // Error codes
    const ENotAdmin: u64 = 0;
    const EInvalidAmount: u64 = 1;

    fun init(_witness: BRIDGE, ctx: &mut TxContext) {
        // The bridge admin will be initialized later via a separate call
    }

    public entry fun bridge_to_recipient(
        admin: &mut AdminCap,
        amount: u64,
        recipient: address,
        eth_sender: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Mint tokens to recipient
        let coin = ibt::mint(&mut admin.treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);

        // Emit event
        event::emit(TokensBridged {
            amount,
            recipient,
            eth_sender
        });
    }

    public entry fun initialize_bridge(
        treasury_cap: TreasuryCap<IBT>,
        ctx: &mut TxContext
    ) {
        transfer::transfer(
            AdminCap {
                id: object::new(ctx),
                treasury_cap
            },
            tx_context::sender(ctx)
        );
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(BRIDGE {}, ctx)
    }
} 