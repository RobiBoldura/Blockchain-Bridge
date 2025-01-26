#[test_only]
module ibt::token_tests {
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::coin::{Self, Coin, TreasuryCap};
    use ibt::token::{Self, IBT};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    // Error codes
    const EInvalidBalance: u64 = 0;

    fun test_scenario(): Scenario { test::begin(ADMIN) }

    #[test]
    fun test_init() {
        let scenario = test_scenario();
        let test = &mut scenario;
        
        // Test initialization
        next_tx(test, ADMIN); {
            token::init_for_testing(ctx(test));
        };

        // Verify TreasuryCap was created and sent to ADMIN
        next_tx(test, ADMIN); {
            assert!(test::has_most_recent_for_address<TreasuryCap<IBT>>(ADMIN), EInvalidBalance);
        };

        test::end(scenario);
    }

    #[test]
    fun test_mint_and_burn() {
        let scenario = test_scenario();
        let test = &mut scenario;

        // Initialize token
        next_tx(test, ADMIN); {
            token::init_for_testing(ctx(test));
        };

        // Mint tokens to USER1
        next_tx(test, ADMIN); {
            let cap = test::take_from_address<TreasuryCap<IBT>>(test, ADMIN);
            token::mint(&mut cap, 100, USER1, ctx(test));
            test::return_to_address(ADMIN, cap);
        };

        // Verify USER1 received the tokens
        next_tx(test, USER1); {
            let coin = test::take_from_address<Coin<IBT>>(test, USER1);
            assert!(coin::value(&coin) == 100, EInvalidBalance);
            test::return_to_address(USER1, coin);
        };

        // Burn tokens from USER1
        next_tx(test, ADMIN); {
            let cap = test::take_from_address<TreasuryCap<IBT>>(test, ADMIN);
            let coin = test::take_from_address<Coin<IBT>>(test, USER1);
            token::burn(&mut cap, coin, ctx(test));
            test::return_to_address(ADMIN, cap);
        };

        // Verify USER1's tokens were burned
        next_tx(test, USER1); {
            assert!(!test::has_most_recent_for_address<Coin<IBT>>(USER1), EInvalidBalance);
        };

        test::end(scenario);
    }

    #[test]
    fun test_merge_and_split() {
        let scenario = test_scenario();
        let test = &mut scenario;

        // Initialize token
        next_tx(test, ADMIN); {
            token::init_for_testing(ctx(test));
        };

        // Mint tokens to USER1
        next_tx(test, ADMIN); {
            let cap = test::take_from_address<TreasuryCap<IBT>>(test, ADMIN);
            token::mint(&mut cap, 100, USER1, ctx(test));
            token::mint(&mut cap, 50, USER1, ctx(test));
            test::return_to_address(ADMIN, cap);
        };

        // Test merge
        next_tx(test, USER1); {
            let coin1 = test::take_from_address<Coin<IBT>>(test, USER1);
            let coin2 = test::take_from_address<Coin<IBT>>(test, USER1);
            token::merge(&mut coin1, coin2);
            assert!(coin::value(&coin1) == 150, EInvalidBalance);
            test::return_to_address(USER1, coin1);
        };

        // Test split
        next_tx(test, USER1); {
            let coin = test::take_from_address<Coin<IBT>>(test, USER1);
            token::split(&mut coin, 50, ctx(test));
            assert!(coin::value(&coin) == 100, EInvalidBalance);
            test::return_to_address(USER1, coin);
        };

        // Verify split result
        next_tx(test, USER1); {
            let coin1 = test::take_from_address<Coin<IBT>>(test, USER1);
            let coin2 = test::take_from_address<Coin<IBT>>(test, USER1);
            assert!(coin::value(&coin1) == 100, EInvalidBalance);
            assert!(coin::value(&coin2) == 50, EInvalidBalance);
            test::return_to_address(USER1, coin1);
            test::return_to_address(USER1, coin2);
        };

        test::end(scenario);
    }
}
