import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ProductVariation } from "@/types/product.types";

export type Color = {
  name: string;
  code: string;
};

// Define a type for the slice state
interface ProductsState {
  colorSelection: Color;
  sizeSelection: string;
  selectedVariation: ProductVariation | null;
}

// Define the initial state using that type
const initialState: ProductsState = {
  colorSelection: {
    name: "Brown",
    code: "bg-[#4F4631]",
  },
  sizeSelection: "Large",
  selectedVariation: null,
};

export const productsSlice = createSlice({
  name: "products",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setColorSelection: (state, action: PayloadAction<Color>) => {
      state.colorSelection = action.payload;
    },
    setSizeSelection: (state, action: PayloadAction<string>) => {
      state.sizeSelection = action.payload;
    },
    setSelectedVariation: (state, action: PayloadAction<ProductVariation | null>) => {
      state.selectedVariation = action.payload;
    },
  },
});

export const { setColorSelection, setSizeSelection, setSelectedVariation } = productsSlice.actions;

export default productsSlice.reducer;
