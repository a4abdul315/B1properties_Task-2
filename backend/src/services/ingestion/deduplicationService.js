const Listing = require('../../models/Listing');
const SocialMention = require('../../models/SocialMention');

const findDuplicateListing = async (normalizedListing) => {
  return Listing.findOne({
    $or: [
      {
        competitor: normalizedListing.competitor,
        'source.platform': normalizedListing.source.platform,
        'source.externalId': normalizedListing.source.externalId,
      },
      {
        competitor: normalizedListing.competitor,
        normalizedTitle: normalizedListing.title.trim().toLowerCase(),
        normalizedAddress: normalizedListing.address ? normalizedListing.address.trim().toLowerCase() : null,
        priceInMinor: Math.round(normalizedListing.price * 100),
      },
    ],
  });
};

const findDuplicateMention = async (normalizedMention) => {
  return SocialMention.findOne({
    $or: [
      {
        'source.platform': normalizedMention.source.platform,
        'source.externalId': normalizedMention.source.externalId,
      },
      {
        authorHandle: normalizedMention.authorHandle,
        normalizedContent: normalizedMention.content.trim().toLowerCase(),
      },
    ],
  });
};

exports.upsertListing = async (normalizedListing) => {
  const duplicate = await findDuplicateListing(normalizedListing);

  if (duplicate) {
    duplicate.price = normalizedListing.price;
    duplicate.currency = normalizedListing.currency;
    duplicate.status = normalizedListing.status;
    duplicate.area = normalizedListing.area;
    duplicate.category = normalizedListing.category;
    duplicate.address = normalizedListing.address;
    duplicate.source.lastSeenAt = normalizedListing.source.lastSeenAt;
    duplicate.source.fetchedAt = normalizedListing.source.fetchedAt;
    duplicate.source.externalUrl = normalizedListing.source.externalUrl;
    duplicate.listedAt = normalizedListing.listedAt;
    duplicate.metadata = {
      ...duplicate.metadata,
      ...normalizedListing.metadata,
    };

    return duplicate.save();
  }

  return Listing.create(normalizedListing);
};

exports.upsertMention = async (Model, normalizedMention) => {
  const duplicate = await findDuplicateMention(normalizedMention);

  if (duplicate) {
    duplicate.sentiment = normalizedMention.sentiment;
    duplicate.engagement = normalizedMention.engagement;
    duplicate.source.collectedAt = normalizedMention.source.collectedAt;
    duplicate.metadata = {
      ...duplicate.metadata,
      ...normalizedMention.metadata,
    };

    return duplicate.save();
  }

  return Model.create(normalizedMention);
};
