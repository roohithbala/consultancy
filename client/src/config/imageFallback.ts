export const CATEGORY_FALLBACKS: Record<string, string> = {
    'COATINGS': 'https://images.unsplash.com/photo-1558444479-c749ddb1b55a?auto=format&fit=crop&q=80&w=800',
    'INTERLININGS': 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800',
    'RAISING': 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800',
    'DRILL': 'https://images.unsplash.com/photo-1582733986280-48ef01859e86?auto=format&fit=crop&q=80&w=800',
    'JERSEY': 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&q=80&w=800',
    'CANVAS': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    'BONDING': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
    'FOAM LAMINATIONS': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    'DEFAULT': 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1000&auto=format&fit=crop'
};

export const getProductImage = (imageUrl: string | undefined, category: string) => {
    if (imageUrl && !imageUrl.startsWith('https://images.unsplash.com') && !imageUrl.startsWith('http')) {
        return imageUrl;
    }
    return imageUrl || CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS['DEFAULT'];
};
