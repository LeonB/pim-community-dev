<?php

namespace spec\Pim\Bundle\EnrichBundle\Normalizer;

use PhpSpec\ObjectBehavior;
use Pim\Bundle\CatalogBundle\Filter\CollectionFilterInterface;
use Pim\Bundle\VersioningBundle\Manager\VersionManager;
use Akeneo\Channel\Component\Model\ChannelInterface;
use Akeneo\Channel\Component\Model\LocaleInterface;
use Prophecy\Argument;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class ChannelNormalizerSpec extends ObjectBehavior
{
    function let(
        NormalizerInterface $channelNormalizer,
        NormalizerInterface $localeNormalizer,
        CollectionFilterInterface $collectionFilter,
        VersionManager $versionManager,
        NormalizerInterface $versionNormalizer
    ) {
        $this->beConstructedWith(
            $channelNormalizer,
            $localeNormalizer,
            $versionManager,
            $versionNormalizer,
            $collectionFilter
        );
    }

    function it_is_a_normalizer()
    {
        $this->shouldImplement('Symfony\Component\Serializer\Normalizer\NormalizerInterface');
    }

    function it_normalizes_a_channel(
        $collectionFilter,
        $localeNormalizer,
        $channelNormalizer,
        ChannelInterface $channel,
        LocaleInterface $locale1,
        LocaleInterface $locale2
    ) {
        $channel->getLocales()->willReturn([$locale1, $locale2]);
        $channel->getId()->willReturn(10);
        $collectionFilter->filterCollection([$locale1, $locale2], 'pim.internal_api.locale.view')
            ->willReturn([$locale1]);
        $localeNormalizer->normalize($locale1, 'standard')->willReturn([
            'code' => 'fr_FR',
            'label' => 'French'
        ]);

        $channelNormalizer->normalize($channel, 'standard', [])->willReturn([
            'keyFromNormalizer' => 'dataFromNormalizer'
        ]);

        $this->normalize($channel, Argument::cetera())->shouldReturn(
            [
                'keyFromNormalizer' => 'dataFromNormalizer',
                'locales' => [
                    ['code' => 'fr_FR', 'label' => 'French']
                ],

                'meta' => [
                    'id' => 10,
                    'form' => 'pim-channel-edit-form',
                    'created' => null,
                    'updated' => null,
                ]
            ]
        );
    }

    function it_supports_channels_and_internal_api(ChannelInterface $channel)
    {
        $this->supportsNormalization($channel, 'internal_api')->shouldReturn(true);
        $this->supportsNormalization($channel, 'json')->shouldReturn(false);
        $this->supportsNormalization(new \StdClass(), 'internal_api')->shouldReturn(false);
    }
}
