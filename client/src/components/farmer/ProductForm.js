import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, FormControl, FormLabel, Input,
  Textarea, Select, useToast, Grid, Box, Image
} from '@chakra-ui/react';
import { useLanguage } from '../../context/LanguageContext';

const ProductForm = ({ isOpen, onClose, onCreate, editProduct }) => {
  const { t } = useLanguage();
  const toast = useToast();

  const [formData, setFormData] = useState({
    Name: '',
    Category: '',
    Price: '',
    Unit: 'kg',
    Quantity: '',
    Description: '',
    Organic: 'No',
    Listed: false,
    ImageFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const categories = [
    'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Coffee', 'Tea', 'Herbs', 'Other'
  ];

  const units = ['kg', 'g', 'bunch', 'piece', 'litre', 'bag'];

  useEffect(() => {
    if (editProduct) {
      setFormData({
        Name: editProduct.name || '',
        Category: editProduct.category || '',
        Price: editProduct.price ? editProduct.price.toString() : '',
        Unit: editProduct.unit || 'kg',
        Quantity: editProduct.quantity ? editProduct.quantity.toString() : '',
        Description: editProduct.description || '',
        Organic: editProduct.organic ? 'Yes' : 'No',
        Listed: editProduct.listed || false,
        ImageFile: null
      });
      setPreviewImage(editProduct.imageUrl || '');
    } else {
      setFormData({
        Name: '',
        Category: '',
        Price: '',
        Unit: 'kg',
        Quantity: '',
        Description: '',
        Organic: 'No',
        Listed: false,
        ImageFile: null
      });
      setPreviewImage('');
    }
  }, [editProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, ImageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.Name || !formData.Category || !formData.Price || !formData.Quantity) {
      toast({
        title: t('Validation Error'),
        description: t('fill Required Fields'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const productData = {
      id: editProduct ? editProduct.id : Date.now(),
      name: formData.Name,
      category: formData.Category,
      price: parseFloat(formData.Price),
      unit: formData.Unit,
      quantity: parseInt(formData.Quantity),
      description: formData.Description,
      organic: formData.Organic === 'Yes',
      listed: formData.Listed,
      imageUrl: previewImage || `https://source.unsplash.com/random/400x300/?${encodeURIComponent(formData.Name)}`
    };

    setTimeout(() => {
      onCreate(productData);
      setLoading(false);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editProduct ? t('Edit Product') : t('Add New Product')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <Box gridColumn="1 / -1" textAlign="center">
              <Image
                src={previewImage || 'https://via.placeholder.com/400x300?text=Product+Image'}
                alt="Product Preview"
                borderRadius="xl"
                maxH="200px"
                mx="auto"
                mb={4}
                fallbackSrc="https://via.placeholder.com/400x300?text=Loading..."
              />
              <FormControl>
                <FormLabel>{t('Upload Image')}</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </FormControl>
            </Box>

            <FormControl isRequired>
              <FormLabel>{t('Product Name')}</FormLabel>
              <Input
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                placeholder={t('Product Name')}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('Category')}</FormLabel>
              <Select
                name="Category"
                value={formData.Category}
                onChange={handleChange}
                placeholder={t('Select Category')}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('Price Per Unit')} (KES)</FormLabel>
              <Input
                type="Number"
                name="Price"
                value={formData.Price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('unit')}</FormLabel>
              <Select
                name="Unit"
                value={formData.Unit}
                onChange={handleChange}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('Available Quantity')}</FormLabel>
              <Input
                type="Number"
                name="Quantity"
                value={formData.Quantity}
                onChange={handleChange}
                placeholder="0"
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t('Organic')}</FormLabel>
              <Select
                name="Organic"
                value={formData.Organic}
                onChange={handleChange}
              >
                <option value="Yes">{t('yes')}</option>
                <option value="No">{t('no')}</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>{t('list In Marketplace')}</FormLabel>
              <Select
                name="Listed"
                value={formData.Listed ? 'Yes' : 'No'}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    Listed: e.target.value === 'Yes'
                  }))
                }
              >
                <option value="Yes">{t('listed')}</option>
                <option value="No">{t('Not Listed')}</option>
              </Select>
            </FormControl>
          </Grid>

          <FormControl mt={6}>
            <FormLabel>{t('Description')}</FormLabel>
            <Textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              placeholder={t('Product Description')}
              rows={4}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={loading}
          >
            {editProduct ? t('Update Product') : t('Add Product')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductForm;

