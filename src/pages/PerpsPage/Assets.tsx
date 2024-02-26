import React from 'react';
import {
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw,
} from '@orderly.network/hooks';
import { API } from '@orderly.network/types';
import {
  Button,
  Flex,
  Grid,
  Heading,
  Table,
  TextField,
} from '@radix-ui/themes';
import { JsonRpcSigner } from '@ethersproject/providers';
import { FC, useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';

export const Assets: FC = () => {
  const { account, chainId } = useActiveWeb3React();
  const collateral = useCollateral();
  const [chains] = useChains('testnet', {
    filter: (item: API.Chain) =>
      item.network_infos?.chain_id === Number(chainId),
  });

  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);

  const [amount, setAmount] = useState<string | undefined>();

  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
    depositorAddress: account,
  });
  const { withdraw } = useWithdraw();

  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Assets</Heading>
      <Table.Root>
        <Table.Body>
          <Table.Row style={{ color: 'white' }}>
            <Table.RowHeaderCell>Wallet Balance:</Table.RowHeaderCell>
            <Table.Cell>{deposit.balance}</Table.Cell>
          </Table.Row>
          <Table.Row style={{ color: 'white' }}>
            <Table.RowHeaderCell>Deposit Balance:</Table.RowHeaderCell>
            <Table.Cell>{collateral.availableBalance}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <Grid
        columns='2'
        rows='2'
        gap='1'
        style={{
          gridTemplateAreas: `'input input' 'deposit withdraw' 'mint mint'`,
        }}
      >
        <TextField.Root style={{ gridArea: 'input', color: 'white' }}>
          <TextField.Input
            type='number'
            step='0.01'
            min='0'
            placeholder='USDC amount'
            onChange={(event) => {
              setAmount(event.target.value);
            }}
          />
        </TextField.Root>

        <Button
          style={{ gridArea: 'deposit', color: 'white' }}
          disabled={amount == null}
          onClick={async () => {
            if (amount == null) return;
            if (Number(deposit.allowance) < Number(amount)) {
              await deposit.approve(amount.toString());
            } else {
              await deposit.deposit();
            }
          }}
        >
          {Number(deposit.allowance) < Number(amount) ? 'Approve' : 'Deposit'}
        </Button>

        <Button
          style={{ gridArea: 'withdraw', color: 'white' }}
          disabled={amount == null}
          onClick={async () => {
            if (amount == null) return;
            await withdraw({
              chainId: Number(chainId),
              amount: amount,
              token: 'USDC',
              allowCrossChainWithdraw: false,
            });
          }}
        >
          Withdraw
        </Button>
      </Grid>
    </Flex>
  );
};