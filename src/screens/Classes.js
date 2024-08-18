import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Classes = ({ navigation }) => {
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load classes from Firestore on component mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classesSnapshot = await firestore().collection('classes').get();
        const classList = classesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(c => c.name && c.name.trim() !== ''); // Filter out any blank classes
        setClasses(classList);
      } catch (error) {
        console.error('Error loading classes: ', error);
      }
    };

    loadClasses();
  }, []);

  // Save new class to Firestore
  const saveClass = async (newClass) => {
    if (!newClass.name || newClass.name.trim() === '') {
      return; // Prevent saving a class with an empty name
    }

    // Check if a class with the same name already exists
    const existingClass = classes.find(c => c.name.toLowerCase() === newClass.name.trim().toLowerCase());
    if (existingClass) {
      Alert.alert('Error', 'A class with this name already exists.');
      return;
    }

    try {
      const classRef = await firestore().collection('classes').add(newClass);
      setClasses([...classes, { id: classRef.id, ...newClass }]);
    } catch (error) {
      console.error('Error saving class: ', error);
    }
  };

  // Delete class from Firestore
  const deleteClass = async (classId) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('classes').doc(classId).delete();
              const updatedClasses = classes.filter(c => c.id !== classId);
              setClasses(updatedClasses);
            } catch (error) {
              console.error('Error deleting class: ', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handle adding a new class
  const addClass = () => {
    if (className.trim() === '') {
      Alert.alert('Error', 'Class name cannot be empty.');
      return;
    }
    const newClass = { name: className.trim(), students: [] }; // Initialize with an empty students array
    saveClass(newClass);
    setClassName('');
    setShowAddClassModal(false);
  };

  // Search students across all classes
  const searchStudents = async () => {
    const allStudents = [];
    for (const classItem of classes) {
      const classDoc = await firestore().collection('classes').doc(classItem.id).get();
      if (classDoc.exists) {
        const students = classDoc.data().students || [];
        allStudents.push(...students.map(student => ({ ...student, className: classItem.name })));
      }
    }

    const filteredResults = allStudents.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filteredResults);
  };

  // Handle search result selection
  const handleSearchResultPress = (className) => {
    setShowSearchModal(false);
    setSearchQuery('');
    navigation.navigate('ClassDetails', { className });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowAddClassModal(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Class</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowSearchModal(true)} style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Search Student</Text>
      </TouchableOpacity>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id} // Ensure unique key
        renderItem={({ item }) => (
          <View style={styles.classItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ClassDetails', { className: item.name })}
              style={styles.classButton}
            >
              <Text style={styles.classButtonText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteClass(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Class Modal */}
      <Modal
        transparent={true}
        visible={showAddClassModal}
        animationType="slide"
        onRequestClose={() => setShowAddClassModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Enter class name"
              value={className}
              onChangeText={setClassName}
            />
            <TouchableOpacity onPress={addClass} style={styles.addModalButton}>
              <Text style={styles.addModalButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddClassModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search Student Modal */}
      <Modal
        transparent={true}
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Enter student name"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={searchStudents} style={styles.searchModalButton}>
              <Text style={styles.searchModalButtonText}>Search</Text>
            </TouchableOpacity>
            {searchResults.length === 0 ? (
              <Text style={styles.noResultsText}>No students found</Text>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSearchResultPress(item.className)} style={styles.resultItem}>
                    <Text style={styles.resultText}>{item.name} - {item.className}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity onPress={() => setShowSearchModal(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  searchButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  classButton: {
    flex: 1,
  },
  classButtonText: {
    fontSize: 18,
    color: '#007bff',
  },
  deleteButton: {
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  addModalButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addModalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  searchModalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff3b30',
    fontSize: 16,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  resultText: {
    fontSize: 16,
    color: '#495057',
  },
  noResultsText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default Classes;
