import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const classes = [
  { id: '1', name: 'Class 1' },
  { id: '2', name: 'Class 2' },
  // Add more classes as needed
];

const ClassSelection = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Classes', { classId: item.id })}>
      <View style={{ padding: 20, borderBottomWidth: 1 }}>
        <Text style={{ fontSize: 18 }}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Select a Class</Text>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default ClassSelection;