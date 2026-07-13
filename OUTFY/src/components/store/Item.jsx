import React from 'react';
import './Item.css';


const Item = ({ product }) => {
  const image = product.images?.[0] || '/prod-dress.png';
  const price = `₹${Number(product.price).toLocaleString()}`;

  return (
    <a className="item-card" href={`/product/${product._id}`}>
      {/* Image */}
      <div className="item-card__img-wrap">
        <img src={image} alt={product.name} />
        {product.badge && (
          <span className="item-card__badge">{product.badge}</span>
        )}
      </div>

      {/* Info */}
      <div className="item-card__info">
        <p className="item-card__category">{product.category}</p>
        <p className="item-card__name">{product.name}</p>
        <p className="item-card__price">{price}</p>
      </div>
    </a>
  );
};

export default Item;
