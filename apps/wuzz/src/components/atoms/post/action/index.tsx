import React from 'react';
import Pressable from '../../pressable';
import theme from '../../theme';
import Text from '../../text';
import {Save2, Send2} from 'iconsax-react-native';
import {FlashList} from '@shopify/flash-list';
import {Box, Divider, Flex, HStack} from '@wuzz/native/components';
import {memo} from 'react';
import TurboImage from 'react-native-turbo-image';
import { formatNumber } from '@features/utils';


type UserType = {
  profile: string;
  name: string;
  username: string;
};

interface ActionProps {
  people: UserType[];
  like: number;
  reply: number;
}

const Action = memo((props: ActionProps) => {
  const {people, like, reply} = props;
  return (
    <HStack margin={{marginHorizontal: -20}} items="center">
      <Flex
        width={20}
        height={1}
        backgroundColor={theme.pallate.neutral['04']}
      />
      <Pressable
        backgroundColor={theme.pallate.neutral['04']}
        gap={4}
        padding={{
          paddingVertical: 8,
          paddingRight: 12,
          paddingLeft: 8,
        }}
        borderRadius={24}
        items="center">
        <FlashList
          data={people}
          horizontal
          estimatedItemSize={18}
          renderItem={({item, index: i}) => (
            <Box
              width={{sm: 16, md: 18, lg: 18}}
              height={{sm: 16, md: 18, lg: 18}}
              borderWidth={1}
              borderRadius={9}
              margin={{
                marginLeft: i ? -8 : 0,
              }}
              borderColor={theme.pallate.neutral['04']}
              as={
                <TurboImage
                  source={{
                    uri: item.profile,
                  }}
                  style={undefined}
                />
              }
            />
          )}
        />
        <Text
          type={{sm: 'l2', md: 'l1', lg: 'l1'}}
          color={theme.pallate.neutral['01']}>
          {formatNumber(reply)} Replies
        </Text>
      </Pressable>
      <Divider thickness={{sm: 14, md: 20, lg: 20}} horizontal />
      <HStack items="center" fill gap={{sm: 14, md: 20, lg: 20}}>
        <Pressable gap={4} items="center">
          <Box borderRadius={12} width={24} height={24} backgroundColor={theme.pallate.neutral['01']} />
          <Text
            type={{sm: 'l2', md: 'l1', lg: 'l1'}}
            color={theme.pallate.neutral['01']}>
            {formatNumber(like)} Bam!
          </Text>
        </Pressable>
        <Pressable>
          <Send2 color={theme.pallate.neutral['01']} />
        </Pressable>
        <Pressable>
          <Save2 color={theme.pallate.neutral['01']} />
        </Pressable>
        <Flex fill height={1} backgroundColor={theme.pallate.neutral['04']} />
      </HStack>
    </HStack>
  );
});


export default Action;
