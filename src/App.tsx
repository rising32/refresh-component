import React from 'react';
import {
  FlatList,
  SafeAreaView,
  View,
  Dimensions,
  Text,
  StyleSheet,
  Image,
  FlatListProps,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RefreshableWrapper from './components/RefreshableWrapper';
import Animated, {useSharedValue} from 'react-native-reanimated';
import {IUser, useUserList} from './lib/hooks/useUserList';

const {width} = Dimensions.get('screen');
const AnimatedFlatlist =
  Animated.createAnimatedComponent<FlatListProps<IUser>>(FlatList);

const App = () => {
  const contentOffset = useSharedValue(0);

  const {loading, users, loadUsers} = useUserList();

  const ListEmptyComponent = () => (
    <View>
      <Text>No User</Text>
    </View>
  );
  const renderItem = ({item}: {item: IUser}) => (
    <View
      style={{
        width: '90%',
        height: 300,
        backgroundColor: 'white',
        elevation: 5,
        marginBottom: 20,
        alignSelf: 'center',
        padding: 20,
      }}>
      <Text>{item.first_name}</Text>
      <Text>{item.email}</Text>
      <Image source={{uri: item.avatar}} style={{width: 200, height: 200}} />
    </View>
  );
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Refresh Control</Text>
        </View>
        <RefreshableWrapper
          contentOffset={contentOffset}
          isLoading={loading}
          onRefresh={loadUsers}>
          <AnimatedFlatlist
            data={users}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={ListEmptyComponent}
            style={styles.scrollList}
            contentContainerStyle={styles.contenContainer}
          />
        </RefreshableWrapper>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width,
    height: 100,
    backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
  },
  contenContainer: {
    paddingVertical: 10,
    paddingBottom: 100,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollList: {width, paddingTop: 0},
});

export default App;
