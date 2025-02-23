import { Dimensions } from 'react-native';

export const colors = {
    primary: '#6C5CE7',
    secondary: '#A8A4FF',
    background: '#F8F9FE',
    white: '#FFFFFF',
    error: '#FF6B6B',
    text: {
        primary: '#2D3436',
        secondary: '#636E72',
        light: '#B2BEC3',
    },
    gradient: {
        start: '#6C5CE7',
        end: '#A8A4FF',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
};

export const { width: SCREEN_WIDTH } = Dimensions.get('window');
