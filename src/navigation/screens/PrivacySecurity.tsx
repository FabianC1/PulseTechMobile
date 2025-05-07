import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'styled-components/native';

export function PrivacySecurity() {
  const theme = useTheme();
  const [sections, setSections] = useState<{ title: string; text: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Privacy & Security data from MongoDB
  useEffect(() => {
    const fetchPrivacySecurity = async () => {
      try {
        const response = await fetch("http://10.249.112.253:3000/collections/PrivacyAndSecurity");
        const data = await response.json();

        if (data && data[0] && data[0].privacyAndSecurity) {
          setSections(data[0].privacyAndSecurity);
        } else {
          console.log("No Privacy & Security data found.");
        }
      } catch (error) {
        console.error("Error fetching Privacy & Security data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacySecurity();
  }, []);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : sections.length > 0 ? (
          sections.map((section, index) => (
            <View key={index} style={styles.sectionContainer}>
              {/* Section Title */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>

              {/* Gradient Underline */}
              <LinearGradient
                colors={['#0091ff', '#8400ff']} // Blue to purple gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />

              {/* Section Content */}
              {section.text.map((paragraph, idx) => (
                <Text key={idx} style={[styles.content, { color: theme.colors.secondary }]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No Privacy & Security data found.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionContainer: { marginBottom: 25, alignItems: 'center' }, // Center alignment for sections
  sectionTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  underline: {
    height: 3, // Thickness of the underline
    width: '70%', // Wider underline for better balance
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 5, // Smooth edges
  },
  content: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 8 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});
