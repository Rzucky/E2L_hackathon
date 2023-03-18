import React, { useState } from "react";

const Search = ({ handleSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (event) => {
    setQuery(event.target.value);
    handleSearch(event.target.value);
  };

  return (
    <div>
      <input type="text" value={query} onChange={handleChange} />
    </div>
  );
};

const Data = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    const filtered = data.filter((item) => {
      for (const key in item) {
        if (
          typeof item[key] === "string" &&
          item[key].toLowerCase().includes(query.toLowerCase())
        ) {
          return true;
        }
      }
      return false;
    });
    setFilteredData(filtered);
    setSearchQuery(query);
  };

  return (
    <div>
      <Search handleSearch={handleSearch} />
      <ul>
        {filteredData.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDB;
