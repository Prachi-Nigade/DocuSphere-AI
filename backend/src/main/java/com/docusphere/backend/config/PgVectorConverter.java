package com.docusphere.backend.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

/**
 * JPA AttributeConverter to seamlessly bridge Java float[] arrays
 * with PostgreSQL pgvector (e.g., vector(1536)) column representations.
 */
@Converter(autoApply = false)
public class PgVectorConverter implements AttributeConverter<float[], String> {

    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null || attribute.length == 0) {
            return null;
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < attribute.length; i++) {
            sb.append(attribute[i]);
            if (i < attribute.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return new float[0];
        }
        String clean = dbData.trim();
        if (clean.startsWith("[")) {
            clean = clean.substring(1);
        }
        if (clean.endsWith("]")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        if (clean.trim().isEmpty()) {
            return new float[0];
        }
        String[] parts = clean.split(",");
        float[] vector = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vector[i] = Float.parseFloat(parts[i].trim());
        }
        return vector;
    }
}
