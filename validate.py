import json
import sys
from jsonschema import validate, ValidationError

def main():
    with open("schema.json", encoding="utf-8") as f:
        schema = json.load(f)
    with open("patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    # Check unique IDs
    ids = [p["id"] for p in data["patterns"]]
    duplicates = [id for id in ids if ids.count(id) > 1]
    if duplicates:
        print(f"ERRO: IDs duplicados encontrados: {set(duplicates)}")
        sys.exit(1)

    try:
        validate(instance=data, schema=schema)
        print(f"OK: {len(data['patterns'])} padrões validados com sucesso.")
    except ValidationError as e:
        print(f"ERRO de validação: {e.message}")
        print(f"  Caminho: {list(e.absolute_path)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
