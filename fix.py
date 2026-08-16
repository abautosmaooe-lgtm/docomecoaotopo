import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Fix the first broken onClick handler
broken_onClick_1 = """                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                    if (window.confirm("Você tem certeza que quer excluir esta publicação para sempre?")) { handleDeleteArticle(art.id); }
                                  }
                                }}"""

fixed_onClick_1 = """                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteArticle(art.id);
                                }}"""

# Fix the second broken onClick handler
broken_onClick_2 = """                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                  handleDeleteArticle(art.id);
                                }
                              }}"""

fixed_onClick_2 = """                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteArticle(art.id);
                              }}"""

text = text.replace(broken_onClick_1, fixed_onClick_1)
text = text.replace(broken_onClick_2, fixed_onClick_2)

with open("src/App.tsx", "w") as f:
    f.write(text)
