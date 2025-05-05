export interface Address {
  city: string;
  country: string;
  line1: string;
  line2: string | null;
  postal_code: string;
  state: string | null;
}

export interface Customer {
  address: Address;
  email: string;
  name: string;
}

export interface Product {
  name: string;
  price: number;
}
