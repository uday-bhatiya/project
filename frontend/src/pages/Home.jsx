import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const backUrl = import.meta.env.VITE_BACKEND_ENDPOINT;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backUrl}/products/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [backUrl, token, navigate]);

 // create 
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backUrl}/products`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([...products, res.data]);
      closeCreateModal();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    }
  };

  // update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${backUrl}/products/${currentProduct._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(
        products.map((p) => (p._id === res.data._id ? res.data : p))
      );
      closeUpdateModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${backUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", description: "", price: "" });
    setShowCreateModal(true);
    setTimeout(() => setAnimateModal(true), 10);
  };
  const closeCreateModal = () => {
    setAnimateModal(false);
    setTimeout(() => setShowCreateModal(false), 200);
  };

  const openUpdateModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
    });
    setShowUpdateModal(true);
    setTimeout(() => setAnimateModal(true), 10);
  };
  const closeUpdateModal = () => {
    setAnimateModal(false);
    setTimeout(() => setShowUpdateModal(false), 200);
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 transition">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Your Products</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            + Create New Product
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {products.length === 0 ? (
          <p className="text-gray-500 text-center">No products found. Add your first one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  {product.price && (
                    <p className="text-blue-600 font-medium">
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => openUpdateModal(product)}
                    className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition shadow-sm"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* craete */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-200 ${
              animateModal ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Create New Product
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* update */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-200 ${
              animateModal ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Update Product
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
