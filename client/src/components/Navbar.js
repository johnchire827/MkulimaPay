import { Button } from '@chakra-ui/react'; // Add this line
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const user = useAuth();

  return (
    <div>
      {/* Other navigation items */}
      {user && (user.role === 'farmer' || user.role === 'both') && (
        <Link to="/add-product">
          <Button
            leftIcon={<FaPlus />}
            colorScheme="green"
            variant="solid"
            ml={4}
          >
            Add Product
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Navigation;