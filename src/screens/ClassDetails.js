import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import ClipChart from '../components/ClipChart.js';

const ClassDetails = ({ route }) => {
  const { className } = route.params;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClassDetails = async () => {
      const classDoc = await firestore().collection('classes').doc(className).get();
      if (classDoc.exists) {
        setStudents(classDoc.data().students || []);
      } else {
        const initialStudents = [{
          id: 1,
          name: `Student 1`,
          image: null,
          clipPosition: 1, // Start at green (position 1)
        }];
        await firestore().collection('classes').doc(className).set({ students: initialStudents });
        setStudents(initialStudents);
      }
      setLoading(false);
    };

    loadClassDetails();
  }, [className]);

  const saveClassDetails = async (updatedStudents) => {
    await firestore().collection('classes').doc(className).set({ students: updatedStudents });
    setStudents(updatedStudents);
  };

  const updateStudent = (id, updatedData) => {
    const updatedStudents = students.map(student =>
      student.id === id ? { ...student, ...updatedData } : student
    );
    saveClassDetails(updatedStudents);
  };

  const pickImage = async (id) => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (!response.didCancel && !response.error && response.assets && response.assets.length > 0) {
        updateStudent(id, { image: response.assets[0].uri });
      }
    });
  };

  const handleImagePress = (id) => {
    Alert.alert(
      'Change Image',
      'Do you want to change the image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', onPress: () => pickImage(id) },
      ],
      { cancelable: true }
    );
  };

  const addStudent = () => {
    const newStudent = {
      id: students.length + 1,
      name: `Student ${students.length + 1}`,
      image: null,
      clipPosition: 1, // Start at green
    };
    saveClassDetails([...students, newStudent]);
  };

  const deleteStudent = (id) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedStudents = students.filter(student => student.id !== id);
            saveClassDetails(updatedStudents);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteAllStudents = () => {
    Alert.alert(
      'Delete All Students',
      'Are you sure you want to delete all students?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: () => saveClassDetails([]) },
      ],
      { cancelable: true }
    );
  };

  const updateClipPosition = (id, newPosition) => {
    updateStudent(id, { clipPosition: newPosition });
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{className} - Class List</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentContainer}>
            {item.image ? (
              <TouchableOpacity onPress={() => handleImagePress(item.id)}>
                <Image source={{ uri: item.image }} style={styles.studentImage} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => pickImage(item.id)} style={styles.uploadImageButton}>
                <Text style={styles.uploadImageButtonText}>Upload Image</Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.studentName}
              value={item.name}
              onChangeText={(text) => updateStudent(item.id, { name: text })}
            />
            <ClipChart
              initialPosition={item.clipPosition}
              onPositionChange={(newPosition) => updateClipPosition(item.id, newPosition)}
            />
            <TouchableOpacity onPress={() => deleteStudent(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.footerButtonsContainer}>
        <TouchableOpacity onPress={addStudent} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Student</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteAllStudents} style={styles.deleteAllButton}>
          <Text style={styles.deleteAllButtonText}>Delete All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#343a40',
  },
  studentContainer: {
    marginBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  studentName: {
    fontSize: 18,
    marginBottom: 8,
    width: '80%',
    textAlign: 'center',
    color: '#495057',
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
    padding: 5,
  },
  studentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  uploadImageButton: {
    marginBottom: 10,
  },
  uploadImageButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 16,
  },
  footerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteAllButtonText: {
    color: '#ff3b30',
    fontSize: 16,
  },
});

export default ClassDetails;