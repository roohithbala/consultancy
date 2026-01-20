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
                x.relatedSampleId === item.relatedSampleId
            );

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x.id === existItem.id && x.type === existItem.type && x.customization === existItem.customization && x.relatedSampleId === existItem.relatedSampleId ? item : x
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            state.totalAmount = calculateTotal(state.cartItems);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        removeFromCart: (state, action: PayloadAction<{ id: string; type?: 'regular' | 'sample' }>) => {
            const { id, type } = action.payload;
            state.cartItems = state.cartItems.filter((x) => !(x.id === id && x.type === type));
            state.totalAmount = calculateTotal(state.cartItems);
            localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        },
        updateCartItem: (state, action: PayloadAction<{ id: string; type: 'regular' | 'sample'; oldCustomization?: string; newQuantity?: number; newCustomization?: string }>) => {
            const { id, type, oldCustomization, newQuantity, newCustomization } = action.payload;
            const item = state.cartItems.find(x => x.id === id && x.type === type && x.customization === oldCustomization);
            if (item) {
                if (newQuantity !== undefined) item.quantity = newQuantity;
                if (newCustomization !== undefined) item.customization = newCustomization;
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
