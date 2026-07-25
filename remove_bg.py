import sys
try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Please install required packages: pip install rembg pillow")
    sys.exit(1)

def process_image(input_path, output_path):
    print(f"Processing {input_path}...")
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print(f"Saved transparent logo to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python remove_bg.py <input_image> <output_image>")
        sys.exit(1)
    process_image(sys.argv[1], sys.argv[2])
