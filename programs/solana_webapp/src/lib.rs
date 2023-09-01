use anchor_lang::prelude::*;

declare_id!("CyeBbYJ6xgihWbQLraz6TPAS1mfhatv3BXFUhfcNXfnu");

#[program]
pub mod solana_webapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, age: String, favpet: String) -> Result<()> {
        
        ctx.accounts.init_account.name = name.to_string();
        ctx.accounts.init_account.age = age.to_string();
        ctx.accounts.init_account.favpet = favpet.to_string();

        msg!("Name:\'{}\'", name);
        msg!("Age:\'{}\'", age);
        msg!("Favorite Pet:\'{}\'", favpet);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize <'info>{

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init, 
        payer = signer, 
        space = 8 + 4 + 100 + 1,
    )]
    pub init_account: Account<'info,  UserInfo>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserInfo {
    name: String,
    age: String,
    favpet: String,
}
