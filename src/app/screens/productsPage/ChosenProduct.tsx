import { Container, Stack, Box, Chip, Select, MenuItem, FormControl, InputLabel, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import StarIcon from "@mui/icons-material/Star";
import Divider from "../../components/divider";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper";
import { sweetTopSuccessAlert } from "../../../lib/sweetAlert";

import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { setChosenProduct, setRestaurant } from "./slice";
import { createSelector } from "reselect";
import { Product } from "../../../lib/types/product";
import { retrieveChosenProduct, retrieveRestaurant } from "./selector";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { serverApi } from "../../../lib/config";
import { CartItem } from "../../../lib/types/search";
import { ProductCollection } from "../../../lib/enums/product.enum";

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setRestaurant: (data: Member) => dispatch(setRestaurant(data)),
  setChosenProduct: (data: Product) => dispatch(setChosenProduct(data)),
});

const chosenProductRetriever = createSelector(
  retrieveChosenProduct,
  (chosenProduct) => ({
    chosenProduct,
  }));

const restaurantRetriever = createSelector(
  retrieveRestaurant,
  (restaurant) => ({
    restaurant,
  }));

interface ChosenProductProps {
  onAdd: (item: CartItem) => void;
}

export default function ChosenProduct(props: ChosenProductProps) {
  const { productId } = useParams<{ productId: string }>();
  const { setRestaurant, setChosenProduct } = actionDispatch(useDispatch());
  const { chosenProduct } = useSelector(chosenProductRetriever);
  const { restaurant } = useSelector(restaurantRetriever);
  
  // State for size and quantity selection
  const [selectedSize, setSelectedSize] = useState(chosenProduct?.productSize || '');
  const [quantity, setQuantity] = useState(1);
  
  // Available sizes for football jerseys
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  
  // Collection display names
  const getCollectionDisplayName = (collection: string) => {
    const collectionNames: { [key: string]: string } = {
      'PREMIER_LEAGUE': 'Premier League',
      'LA_LIGA': 'La Liga',
      'SERIE_A': 'Serie A',
      'BUNDESLIGA': 'Bundesliga',
      'LIGUE_1': 'Ligue 1',
      'CHAMPIONS_LEAGUE': 'Champions League',
      'NATIONAL_TEAMS': 'National Teams',
      'UZBEKISTAN_LEAGUE': 'Uzbekistan League',
      'RETRO': 'Retro Collection',
      'OTHER': 'Other',
      'DISH': 'Dish',
      'DRINK': 'Drink'
    };
    return collectionNames[collection] || collection;
  };

  useEffect(() => {
    const product = new ProductService();
    product
      .getProduct(productId)
      .then((data) => {
        setChosenProduct(data);
        setSelectedSize(data?.productSize || '');
      })
      .catch((err) => console.log(err));

    const member = new MemberService();
    member
      .getRestaurant()
      .then((data) => setRestaurant(data))
      .catch((err) => console.log(err));
  }, [productId, setChosenProduct, setRestaurant]);

  if (!chosenProduct) return null;
  const productImages = Array.isArray(chosenProduct.productImages) ? chosenProduct.productImages : [];

  return (
    <div className={"chosen-product"}>
      <Box className={"title"}>
        <SportsSoccerIcon sx={{ fontSize: 40, mr: 2, color: "#ff6b35" }} />
        Jersey Details
      </Box>
      <Container className={"product-container"}>
        {/* Image Gallery Section */}
        <Stack className={"chosen-product-slider"}>
          <Swiper
            loop={true}
            spaceBetween={10}
            navigation={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="swiper-area"
          >
           {productImages.map((ele: string, index: number) => {
              const imagePath = ele.startsWith('http') 
                ? ele 
                : `${serverApi}${ele}`;
              return (
                <SwiperSlide key={index}>
                  <img className="slider-image" src={imagePath} alt={`${chosenProduct.productName} jersey view ${index + 1}`} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </Stack>

        {/* Product Information Section */}
        <Stack className={"chosen-product-info"}>
          <Box className={"info-box"}>
            {/* Jersey Name and Collection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" className={"product-name"}>
              {chosenProduct?.productName}
              </Typography>
              <Chip 
                label={getCollectionDisplayName(chosenProduct?.productCollection || '')}
                color="primary"
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>

            {/* Jersey Details Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SportsSoccerIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    Collection: {getCollectionDisplayName(chosenProduct?.productCollection || '')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StarIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    Volume: {chosenProduct?.productVolume || 'Standard'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RemoveRedEyeIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    Views: {chosenProduct?.productViews}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2" color="text.secondary">
                    Stock: {chosenProduct?.productLeftCount} available
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Rating Section */}
            <Box className={"rating-box"} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating name="half-rating" defaultValue={4.5} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  (4.5/5) • 127 reviews
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography className={"product-desc"} sx={{ mb: 3 }}>
              {chosenProduct?.productDesc || "Premium quality football jersey with authentic team colors and official design. Made from high-quality materials for comfort and durability."}
            </Typography>

            <Divider height="1" width="100%" bg="#e0e0e0" />

            {/* Size Selection */}
            <Box sx={{ my: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Select Size
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableSizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    onClick={() => setSelectedSize(size)}
                    variant={selectedSize === size ? "filled" : "outlined"}
                    color={selectedSize === size ? "primary" : "default"}
                    sx={{
                      minWidth: 50,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedSize === size ? 'primary.main' : 'action.hover'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Quantity Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quantity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  sx={{ minWidth: 40 }}
                >
                  -
                </Button>
                <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setQuantity(Math.min(chosenProduct?.productLeftCount || 10, quantity + 1))}
                  disabled={quantity >= (chosenProduct?.productLeftCount || 10)}
                  sx={{ minWidth: 40 }}
                >
                  +
                </Button>
              </Box>
            </Box>

            {/* Price Section */}
            <Box className={"product-price"} sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff6b35' }}>
                ${chosenProduct?.productPrice}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Free shipping on orders over $50
              </Typography>
            </Box>

            {/* Features */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalShippingIcon sx={{ mr: 1, color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="body2">Free Shipping</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SecurityIcon sx={{ mr: 1, color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="body2">Authentic Quality</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StarIcon sx={{ mr: 1, color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="body2">Official Design</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SportsSoccerIcon sx={{ mr: 1, color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="body2">Team Licensed</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Add to Cart Button */}
            <Box className={"button-box"}>
              <Button 
                variant="contained"
                size="large"
                fullWidth
                onClick={() => {
                  if (chosenProduct && selectedSize) {
                    const cartItem: CartItem = {
                      _id: chosenProduct._id,
                      quantity: quantity,
                      name: `${chosenProduct.productName} (${selectedSize})`,
                      price: chosenProduct.productPrice,
                      image: productImages.length > 0 ? productImages[0] : '/img/noimage-list.svg'
                    };
                    props.onAdd(cartItem);
                    sweetTopSuccessAlert(`${chosenProduct.productName} (${selectedSize}) added to cart!`, 2000);
                  } else {
                    sweetTopSuccessAlert("Please select a size first!", 2000);
                  }
                }}
                disabled={!selectedSize || chosenProduct?.productLeftCount === 0}
                sx={{
                  height: 50,
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #e55a2b, #e8841a)',
                  }
                }}
              >
                {chosenProduct?.productLeftCount === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </Box>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}