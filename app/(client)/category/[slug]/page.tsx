/** @format */

import CategoryProduct from "@/components/CategoryProduct";
import Container from "@/components/Container";
import Title from "@/components/Title";
import { getCategories } from "@/sanity/queries";
import { promises } from "dns";
import React from "react";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const categories = await getCategories();
   const { slug } = await params;

  return (
    <div className="py-10">
      <Container>
        <Title>Products by Categories:{" "}
          <span className="font-bold text-blue-600 capitalize tracking-wide">
            {slug && slug}
          </span>
          </Title>
          <CategoryProduct categories={categories} slug={slug} />
      </Container>
    </div>
  );
};

export default CategoryPage;
