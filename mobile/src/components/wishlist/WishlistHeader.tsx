import React from "react";
import { Card, Text } from "react-native-paper";

export function WishlistHeader() {
  return (
    <Card style={{ marginBottom: 20 }}>
      <Card.Content>
        <Text
          variant="headlineMedium"
          style={{ textAlign: "center", marginBottom: 10 }}
        >
          My Wishlist
        </Text>
      </Card.Content>
    </Card>
  );
}

export default WishlistHeader;
