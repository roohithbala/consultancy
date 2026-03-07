import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    materialType: string;
    type?: 'regular' | 'sample';
    customization?: string;
    color?: string;
    relatedSampleId?: string;
    isRiskAccepted?: boolean;
}

interface CartState {
    cartItems: CartItem[];
    totalAmount: number;
}

const calculateTotal = (items: CartItem[]) => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

const itemsFromStorage = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')!) : [];

const initialState: CartState = {
    cartItems: itemsFromStorage,
    totalAmount: calculateTotal(itemsFromStorage),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) =>
                x.id === item.id &&
                x.type === item.type &&
                x.customization === item.customization &&
                x.color === item.color &&
                x.relatedSampleId === item.relatedSampleId
            );

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x.id === existItem.id && x.type === existItem.type && x.customization === existItem.customization && x.color === existItem.color && x.relatedSampleId === existItem.relatedSampleId ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            state.totalAmount = calculateTotal(state.cartItems);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action: PayloadAction<{ id: string; type?: 'regular' | 'sample'; customization?: string; color?: string }>) => {
            const { id, type, customization, color } = action.payload;
            state.cartItems = state.cartItems.filter((x) => !(x.id === id && x.type === type && x.customization === customization && x.color === color));
            state.totalAmount = calculateTotal(state.cartItems);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        updateCartItem: (state, action: PayloadAction<{ id: string; type: 'regular' | 'sample'; oldCustomization?: string; oldColor?: string; newQuantity?: number; newCustomization?: string; newColor?: string }>) => {
            const { id, type, oldCustomization, oldColor, newQuantity, newCustomization, newColor } = action.payload;
            const itemIndex = state.cartItems.findIndex(x => x.id === id && x.type === type && x.customization === oldCustomization && x.color === oldColor);
            
            if (itemIndex !== -1) {
                const item = state.cartItems[itemIndex];
                const updatedItem = {
                    ...item,
                    quantity: newQuantity !== undefined ? newQuantity : item.quantity,
                    customization: newCustomization !== undefined ? newCustomization : item.customization,
                    color: newColor !== undefined ? newColor : item.color
                };

                // Check if the NEW identity conflicts with an EXISTING different item
                const duplicateIndex = state.cartItems.findIndex((x, idx) => 
                    idx !== itemIndex &&
                    x.id === updatedItem.id &&
                    x.type === updatedItem.type &&
                    x.customization === updatedItem.customization &&
                    x.color === updatedItem.color
                );

                if (duplicateIndex !== -1) {
                    // Merge quantities and remove the old one
                    state.cartItems[duplicateIndex].quantity += updatedItem.quantity;
                    state.cartItems.splice(itemIndex, 1);
                } else {
                    // Just update the item in place
                    state.cartItems[itemIndex] = updatedItem;
                }
            }
            state.totalAmount = calculateTotal(state.cartItems);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.totalAmount = 0;
            localStorage.removeItem('cartItems');
        }
    },
});

export const { addToCart, removeFromCart, clearCart, updateCartItem } = cartSlice.actions;
export default cartSlice.reducer;
