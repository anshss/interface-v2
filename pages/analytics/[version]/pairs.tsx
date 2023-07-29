import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { PairTable } from 'components';
import { Skeleton } from '@mui/lab';
import { useTranslation } from 'next-i18next';
import { useEthPrice } from 'state/application/hooks';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AnalyticsHeader from 'components/pages/analytics/AnalyticsHeader';

const AnalyticsPairs = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  const version = useAnalyticsVersion();

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/top-pairs/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top pairs ${version}`,
        );
      }
      const pairsData = await res.json();
      if (pairsData.data) {
        updateTopPairs(pairsData.data);
      }
    })();
  }, [ethPrice.price, version, chainId]);

  useEffect(() => {
    updateTopPairs(null);
  }, [version]);

  useEffect(() => {
    if (topPairs) {
      dispatch(setAnalyticsLoaded(true));
    } else {
      dispatch(setAnalyticsLoaded(false));
    }
  }, [topPairs, dispatch]);

  return (
    <Box width='100%'>
      <AnalyticsHeader />
      <p>{t('allPairs')}</p>
      <Box mt={4} className='panel'>
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rectangular' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = ['v2', 'v3', 'total'];
  const paths =
    versions?.map((version) => ({
      params: { version },
    })) || [];

  return {
    paths,
    fallback: 'blocking',
  };
};

export default AnalyticsPairs;
