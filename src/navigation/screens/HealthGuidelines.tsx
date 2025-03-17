import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'styled-components/native';

export function HealthGuidelines() {
  const theme = useTheme();
  const [sections, setSections] = useState<{ title: string; text: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Health & Wellness Guidelines from MongoDB
  useEffect(() => {
    const fetchHealthGuidelines = async () => {
      try {
        const response = await fetch("http://192.168.0.84:3000/collections/HealthAndWellnessGuidelines");
        const data = await response.json();

        if (data && data[0] && data[0].healthAndWellnessGuidelines) {
          setSections(data[0].healthAndWellnessGuidelines);
        } else {
          console.log("No Health & Wellness Guidelines found.");
        }
      } catch (error) {
        console.error("Error fetching Health & Wellness Guidelines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthGuidelines();
  }, []);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Health & Wellness Guidelines</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : sections.length > 0 ? (
          sections.map((section, index) => (
            <View key={index} style={styles.section}>
              {/* Section Title */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>

              {/* Gradient Underline - FIXED */}
              <LinearGradient
                colors={['#0091ff', '#8400ff']} // Smooth transition from blue to purple
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientUnderline}
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
          <Text style={styles.errorText}>No Health & Wellness Guidelines found.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  gradientUnderline: {
    height: 3, // Slightly thicker for visibility
    width: '65%', // Wider to make the gradient effect more noticeable
    alignSelf: 'center',
    marginBottom: 12, // More spacing below
    borderRadius: 8, // Smoother rounded edges
  },
  content: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 10 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});
