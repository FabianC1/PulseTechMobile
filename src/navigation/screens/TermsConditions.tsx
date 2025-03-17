import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'styled-components/native';

export function TermsConditions() {
  const theme = useTheme();
  const [sections, setSections] = useState<{ title: string; text: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Terms & Conditions from MongoDB
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch("http://192.168.0.84:3000/collections/legalDocs");
        const data = await response.json();

        if (data && data[0] && data[0].termsAndConditions) {
          setSections(data[0].termsAndConditions); // Extract correct field
        } else {
          console.log("No Terms & Conditions found in response");
        }
      } catch (error) {
        console.error("Error fetching Terms & Conditions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : sections.length > 0 ? (
          sections.map((section, index) => (
            <View key={index} style={styles.sectionContainer}>
              {/* Title */}
              <Text style={[styles.title, { color: theme.colors.text }]}>{section.title}</Text>

              {/* Gradient Underline */}
              <LinearGradient
                colors={['#0091ff', '#8400ff']} // Blue to purple gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />

              {/* Render each paragraph separately */}
              {section.text.map((paragraph, pIndex) => (
                <Text key={pIndex} style={[styles.content, { color: theme.colors.secondary }]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No Terms & Conditions found.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  sectionContainer: { marginBottom: 25 }, // Spacing between sections
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  underline: {
    height: 3, // Thickness of the underline
    width: '50%', // Width of the underline
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 5, // Rounded edges for a smoother look
  },
  content: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 8 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});
