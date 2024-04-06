use penumbra_proto::core::asset::v1::Metadata;
use regex::Regex;

pub static UNBONDING_TOKEN_REGEX: &str = "^uunbonding_(?P<data>start_at_(?P<start>[0-9]+)_(?P<validator>penumbravalid1(?P<id>[a-zA-HJ-NP-Z0-9]+)))$";
pub static DELEGATION_TOKEN_REGEX: &str =
    "^udelegation_(?P<data>penumbravalid1[a-zA-HJ-NP-Z0-9]+)$";
pub static SHORTENED_ID_LENGTH: usize = 8;

pub fn customize_symbol(metadata: Metadata) -> Metadata {
    if let Some(unbonding_match) = Regex::new(UNBONDING_TOKEN_REGEX)
        .expect("regex is valid")
        .captures(&metadata.base)
    {
        let id_match = unbonding_match.name(&"id").unwrap().as_str();
        let shortened_id = id_match
            .chars()
            .take(SHORTENED_ID_LENGTH)
            .collect::<String>();
        let start_match = unbonding_match.name(&"start").unwrap().as_str();

        let customized = Metadata {
            symbol: format!("unbondUMat{start_match}({shortened_id}…)"),
            ..metadata
        };

        return customized;
    } else if let Some(delegation_match) = Regex::new(DELEGATION_TOKEN_REGEX)
        .expect("regex is valid")
        .captures(&metadata.base)
    {
        let id_match = delegation_match.name(&"id").unwrap().as_str();
        let shortened_id = id_match
            .chars()
            .take(SHORTENED_ID_LENGTH)
            .collect::<String>();

        // let customized = metadata.clone();
        let customized = Metadata {
            symbol: format!("delUM({shortened_id}…)"),
            ..metadata
        };

        return customized;
    } else {
        metadata
    }
}
