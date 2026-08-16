with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace("const missing = INITIAL_ARTICLES.filter(initArt => !parsed.find((p: any) => p.id === initArt.id));\n          return [...parsed, ...missing];", "return parsed;")
text = text.replace("const missing = INITIAL_ARTICLES.filter(initArt => !data.articles.find((p: any) => p.id === initArt.id));\n            const merged = [...data.articles, ...missing];\n            setArticles(merged);\n            localStorage.setItem(\"docomeco_articles\", JSON.stringify(merged));", "setArticles(data.articles);\n            localStorage.setItem(\"docomeco_articles\", JSON.stringify(data.articles));")

with open("src/App.tsx", "w") as f:
    f.write(text)
