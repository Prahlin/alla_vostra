import math
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


SOURCE_DIR = (
    Path(__file__).resolve().parents[1]
    / "assets"
    / "tutorial"
    / "smiley-got-it-storyboard"
)
CLEANED_DIR = SOURCE_DIR / "cleaned"
SMOOTH_DIR = SOURCE_DIR / "smooth"
LAYER_DIR = SOURCE_DIR / "animated_layers"
FRAME_NAMES = [f"frame_{index}.png" for index in range(1, 9)]
PRIMARY_KEYFRAMES = [
    ("frame_1.png", 0),
    ("frame_2.png", 170),
    ("frame_3.png", 330),
    ("frame_4.png", 480),
    ("frame_6.png", 650),
    ("frame_8.png", 1000),
]
SPRITE_FRAME_COUNT = 48
SPRITE_COLUMNS = 8
SPRITE_WIDTH = 384
SPRITE_HEIGHT = 512
SPRITE_CELL_PADDING = 4
SPRITE_CELL_WIDTH = SPRITE_WIDTH + SPRITE_CELL_PADDING * 2
SPRITE_CELL_HEIGHT = SPRITE_HEIGHT + SPRITE_CELL_PADDING * 2
SPRITE_SHEET_NAME = "smiley_got_it_sprite.png"
ANIMATED_LAYER_SOURCES = {
    "face_rest.png": "frame_1.png",
    "face_mid.png": "frame_3.png",
    "face_closed.png": "frame_4.png",
    "face_grin.png": "frame_6.png",
    "hand.png": "frame_8.png",
    "sparkle.png": "frame_8.png",
}


def in_number_badge_area(width, height, x, y):
    return x < width * 0.28 and y > height * 0.72


def is_character_seed(width, height, x, y, r, g, b, a):
    if a < 16 or in_number_badge_area(width, height, x, y):
        return False

    max_channel = max(r, g, b)
    is_face_yellow = (
        r > 178
        and g > 116
        and b < 128
        and r > b + 60
        and g > b + 42
    )
    is_hand_green = g > 118 and g > r + 16 and g > b + 12 and max_channel > 130
    is_bright_white = r > 178 and g > 178 and b > 170

    return is_face_yellow or is_hand_green or is_bright_white


def is_face_seed(width, height, x, y, r, g, b, a):
    if a < 16 or in_number_badge_area(width, height, x, y):
        return False

    return (
        r > 172
        and g > 96
        and b < 146
        and r > b + 48
        and g > b + 24
    )


def largest_component_bbox(seed, width, height):
    visited = bytearray(width * height)
    best = None
    neighbor_offsets = (-1, 1, -width, width)

    for y in range(height):
        for x in range(width):
            start = y * width + x

            if not seed[start] or visited[start]:
                continue

            stack = [start]
            visited[start] = 1
            area = 0
            min_x = max_x = x
            min_y = max_y = y

            while stack:
                index = stack.pop()
                cx = index % width
                cy = index // width

                area += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for offset in neighbor_offsets:
                    next_index = index + offset

                    if (
                        next_index < 0
                        or next_index >= len(seed)
                        or visited[next_index]
                        or not seed[next_index]
                    ):
                        continue

                    nx = next_index % width
                    ny = next_index // width

                    if abs(nx - cx) + abs(ny - cy) != 1:
                        continue

                    visited[next_index] = 1
                    stack.append(next_index)

            if best is None or area > best["area"]:
                best = {
                    "area": area,
                    "bbox": (min_x, min_y, max_x, max_y),
                }

    return None if best is None else best["bbox"]


def component_filtered_mask(seed, width, height, keep_component):
    visited = bytearray(width * height)
    kept = bytearray(width * height)
    neighbor_offsets = (-1, 1, -width, width)

    for y in range(height):
        for x in range(width):
            start = y * width + x

            if not seed[start] or visited[start]:
                continue

            component = []
            stack = [start]
            visited[start] = 1
            min_x = max_x = x
            min_y = max_y = y

            while stack:
                index = stack.pop()
                cx = index % width
                cy = index // width

                component.append(index)
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for offset in neighbor_offsets:
                    next_index = index + offset

                    if (
                        next_index < 0
                        or next_index >= len(seed)
                        or visited[next_index]
                        or not seed[next_index]
                    ):
                        continue

                    nx = next_index % width
                    ny = next_index // width

                    if abs(nx - cx) + abs(ny - cy) != 1:
                        continue

                    visited[next_index] = 1
                    stack.append(next_index)

            bbox = (min_x, min_y, max_x, max_y)

            if keep_component(component, bbox):
                for index in component:
                    kept[index] = 255

    return Image.frombytes("L", (width, height), bytes(kept))


def build_face_seed(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    seed = bytearray(width * height)

    for y in range(height):
        for x in range(width):
            r, g, b, a = rgba.getpixel((x, y))

            if is_face_seed(width, height, x, y, r, g, b, a):
                seed[y * width + x] = 1

    return seed


def face_bbox(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size

    return largest_component_bbox(build_face_seed(rgba), width, height)


def build_face_mask(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    seed = build_face_seed(rgba)
    bbox = largest_component_bbox(seed, width, height)
    mask = Image.new("L", (width, height), 0)

    if bbox is None:
        return mask

    min_x, min_y, max_x, _max_y = bbox
    face_width = max_x - min_x
    ellipse_bbox = (
        max(0, min_x - 2),
        max(0, min_y - 4),
        min(width - 1, max_x + 2),
        min(height - 1, min_y + face_width + 6),
    )

    ImageDraw.Draw(mask).ellipse(ellipse_bbox, fill=255)

    return mask.filter(ImageFilter.GaussianBlur(0.55))


def build_face_plus_shadow_mask(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    bbox = face_bbox(rgba)
    mask = build_face_mask(rgba)

    if bbox is None:
        return mask

    min_x, _min_y, max_x, max_y = bbox
    shadow = Image.new("L", (width, height), 0)
    face_width = max_x - min_x
    shadow_bbox = (
        max(0, min_x - face_width * 0.12),
        max(0, max_y - face_width * 0.14),
        min(width - 1, max_x + face_width * 0.16),
        min(height - 1, max_y + face_width * 0.18),
    )

    ImageDraw.Draw(shadow).ellipse(shadow_bbox, fill=255)
    shadow = shadow.filter(ImageFilter.GaussianBlur(4))

    return ImageChops.lighter(
        mask,
        ImageChops.multiply(shadow, mask.filter(ImageFilter.MaxFilter(27))),
    )


def keep_foreground_components(seed, width, height):
    visited = bytearray(width * height)
    kept = bytearray(width * height)
    neighbor_offsets = (-1, 1, -width, width)

    for y in range(height):
        for x in range(width):
            start = y * width + x

            if not seed[start] or visited[start]:
                continue

            component = []
            stack = [start]
            visited[start] = 1
            min_x = max_x = x
            min_y = max_y = y

            while stack:
                index = stack.pop()
                cx = index % width
                cy = index // width

                component.append(index)
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for offset in neighbor_offsets:
                    next_index = index + offset

                    if (
                        next_index < 0
                        or next_index >= len(seed)
                        or visited[next_index]
                        or not seed[next_index]
                    ):
                        continue

                    nx = next_index % width
                    ny = next_index // width

                    if abs(nx - cx) + abs(ny - cy) != 1:
                        continue

                    visited[next_index] = 1
                    stack.append(next_index)

            center_x = (min_x + max_x) / 2
            center_y = (min_y + max_y) / 2
            near_character = (
                width * 0.14 < center_x < width * 0.94
                and height * 0.1 < center_y < height * 0.9
            )

            if len(component) >= 24 and near_character:
                for index in component:
                    kept[index] = 255

    return Image.frombytes("L", (width, height), bytes(kept))


def fill_interior_holes(mask):
    width, height = mask.size
    source = bytearray(1 if value >= 128 else 0 for value in mask.tobytes())
    visited = bytearray(width * height)
    queue = deque()

    for x in range(width):
        queue.append(x)
        queue.append((height - 1) * width + x)

    for y in range(height):
        queue.append(y * width)
        queue.append(y * width + width - 1)

    while queue:
        index = queue.popleft()

        if index < 0 or index >= len(source) or source[index] or visited[index]:
            continue

        visited[index] = 1
        x = index % width

        if x > 0:
            queue.append(index - 1)
        if x < width - 1:
            queue.append(index + 1)
        if index >= width:
            queue.append(index - width)
        if index < len(source) - width:
            queue.append(index + width)

    filled = bytearray(len(source))

    for index, value in enumerate(source):
        if value or not visited[index]:
            filled[index] = 255

    return Image.frombytes("L", (width, height), bytes(filled))


def build_foreground_alpha(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    seed = bytearray(width * height)

    for y in range(height):
        for x in range(width):
            r, g, b, a = rgba.getpixel((x, y))

            if is_character_seed(width, height, x, y, r, g, b, a):
                seed[y * width + x] = 1

    seed_mask = keep_foreground_components(seed, width, height)

    closed = (
        seed_mask
        .filter(ImageFilter.MaxFilter(9))
        .filter(ImageFilter.MinFilter(5))
        .filter(ImageFilter.MaxFilter(3))
    )
    detail_mask = fill_interior_holes(closed)
    face_mask = build_face_mask(rgba)
    alpha = ImageChops.lighter(face_mask, detail_mask)
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.65))

    alpha = alpha.point(lambda value: 255 if value > 242 else value)

    return ImageChops.multiply(alpha, rgba.getchannel("A"))


def clean_frame(frame_name):
    source_path = SOURCE_DIR / frame_name
    output_path = CLEANED_DIR / frame_name
    image = Image.open(source_path).convert("RGBA")
    alpha = build_foreground_alpha(image)
    cleaned = image.copy()

    cleaned.putalpha(alpha)
    cleaned.save(output_path, optimize=True)
    print(f"cleaned {output_path.relative_to(Path.cwd())}")


def ease_in_out_sine(value):
    return 0.5 - 0.5 * math.cos(math.pi * value)


def ease_out_cubic(value):
    return 1 - (1 - value) ** 3


def ease_out_back(value, overshoot=1.45):
    shifted = value - 1
    return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2


def interpolate_value(start, end, amount):
    return start + (end - start) * amount


def load_clean_frame(frame_name):
    return Image.open(CLEANED_DIR / frame_name).convert("RGBA")


def frame_bbox(image):
    alpha = image.getchannel("A")
    return alpha.getbbox() or (0, 0, image.width, image.height)


def compose_normalized_frame(image):
    bbox = frame_bbox(image)
    crop = image.crop(bbox)
    crop_width, crop_height = crop.size
    scale = min(
        1,
        (SPRITE_WIDTH * 0.88) / max(1, crop_width),
        (SPRITE_HEIGHT * 0.66) / max(1, crop_height),
    )
    scaled_width = max(1, round(crop_width * scale))
    scaled_height = max(1, round(crop_height * scale))

    if (scaled_width, scaled_height) != crop.size:
        crop = crop.resize(
            (scaled_width, scaled_height),
            Image.Resampling.LANCZOS,
        )

    frame = Image.new("RGBA", (SPRITE_WIDTH, SPRITE_HEIGHT), (0, 0, 0, 0))
    x = round((SPRITE_WIDTH - scaled_width) / 2)
    y = round(SPRITE_HEIGHT * 0.17 + (SPRITE_HEIGHT * 0.62 - scaled_height) / 2)

    frame.alpha_composite(crop, (x, y))

    return frame


def tween_images(previous, current, amount):
    if amount <= 0:
        return previous.copy()
    if amount >= 1:
        return current.copy()

    return Image.blend(previous, current, amount)


def transform_frame(image, progress):
    scale = 1
    translate_y = 0

    if progress < 0.17:
        local = progress / 0.17
        scale = interpolate_value(1, 0.992, ease_in_out_sine(local))
    elif progress < 0.48:
        local = (progress - 0.17) / 0.31
        scale = interpolate_value(0.992, 1.018, ease_out_cubic(local))
        translate_y = interpolate_value(0, -2, ease_in_out_sine(local))
    elif progress < 0.65:
        local = (progress - 0.48) / 0.17
        eased = min(ease_out_back(local, 1.25), 1.04)
        scale = interpolate_value(1.018, 1.006, eased)
        translate_y = interpolate_value(-2, -1, ease_in_out_sine(local))
    elif progress < 0.83:
        local = (progress - 0.65) / 0.18
        scale = interpolate_value(0.982, 1.035, min(ease_out_back(local), 1.08))
        translate_y = interpolate_value(6, -2, ease_out_cubic(local))
    else:
        local = (progress - 0.83) / 0.17
        scale = interpolate_value(1.018, 1, ease_out_cubic(local))
        translate_y = interpolate_value(-2, 0, ease_in_out_sine(local))

    if abs(scale - 1) < 0.001 and abs(translate_y) < 0.001:
        return image

    width = max(1, round(SPRITE_WIDTH * scale))
    height = max(1, round(SPRITE_HEIGHT * scale))
    transformed = image.resize((width, height), Image.Resampling.BICUBIC)
    output = Image.new("RGBA", (SPRITE_WIDTH, SPRITE_HEIGHT), (0, 0, 0, 0))
    x = round((SPRITE_WIDTH - width) / 2)
    y = round((SPRITE_HEIGHT - height) / 2 + translate_y)

    output.alpha_composite(transformed, (x, y))

    return output


def build_sprite_frame(normalized_keyframes, progress):
    elapsed = progress * PRIMARY_KEYFRAMES[-1][1]

    for index, ((_previous_name, start_ms), (_next_name, end_ms)) in enumerate(
        zip(PRIMARY_KEYFRAMES, PRIMARY_KEYFRAMES[1:])
    ):
        if elapsed <= end_ms or index == len(PRIMARY_KEYFRAMES) - 2:
            local = (elapsed - start_ms) / (end_ms - start_ms)
            local = max(0, min(1, local))

            if end_ms <= 330:
                eased = ease_out_cubic(local)
            elif end_ms <= 650:
                eased = ease_in_out_sine(local)
            else:
                eased = min(ease_out_back(local, 1.35), 1)

            previous_image = normalized_keyframes[index]
            next_image = normalized_keyframes[index + 1]

            return transform_frame(
                tween_images(previous_image, next_image, eased),
                progress,
            )

    return normalized_keyframes[-1].copy()


def clamp01(value):
    return max(0, min(1, value))


def interval_progress(value, start, end):
    if end <= start:
        return 1 if value >= end else 0

    return clamp01((value - start) / (end - start))


def opacity_between(value, fade_in_start, full_start, full_end, fade_out_end):
    if value <= fade_in_start or value >= fade_out_end:
        return 0
    if full_start <= value <= full_end:
        return 1
    if value < full_start:
        return interval_progress(value, fade_in_start, full_start)

    return 1 - interval_progress(value, full_end, fade_out_end)


def set_layer_opacity(layer, opacity):
    if opacity >= 0.999:
        return layer

    output = layer.copy()
    alpha = output.getchannel("A").point(
        lambda alpha_value: round(alpha_value * clamp01(opacity))
    )
    output.putalpha(alpha)

    return output


def transform_layer(layer, scale=1, rotate=0, translate=(0, 0)):
    if (
        abs(scale - 1) < 0.001
        and abs(rotate) < 0.001
        and abs(translate[0]) < 0.001
        and abs(translate[1]) < 0.001
    ):
        return layer

    transformed = layer

    if abs(scale - 1) >= 0.001:
        scaled_size = (
            max(1, round(layer.width * scale)),
            max(1, round(layer.height * scale)),
        )
        transformed = transformed.resize(scaled_size, Image.Resampling.BICUBIC)

    if abs(rotate) >= 0.001:
        transformed = transformed.rotate(
            rotate,
            resample=Image.Resampling.BICUBIC,
            expand=False,
        )

    output = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    x = (layer.width - transformed.width) / 2 + translate[0]
    y = (layer.height - transformed.height) / 2 + translate[1]
    paste_shifted_layer(output, transformed, (x, y))

    return output


def composite_layer(output, layer, opacity=1, scale=1, rotate=0, translate=(0, 0)):
    if opacity <= 0.001:
        return

    transformed = transform_layer(layer, scale=scale, rotate=rotate, translate=translate)
    output.alpha_composite(set_layer_opacity(transformed, opacity))


def build_layered_sprite_frame(
    progress,
    rest_face,
    mid_face,
    closed_face,
    grin_face,
    hand,
    sparkle,
):
    output = Image.new("RGBA", (SPRITE_WIDTH, SPRITE_HEIGHT), (0, 0, 0, 0))
    eased_progress = ease_in_out_sine(progress)
    face_scale = interpolate_value(
        1,
        1.018,
        ease_out_cubic(interval_progress(progress, 0.26, 0.56)),
    )
    if progress > 0.62:
        face_scale = interpolate_value(
            face_scale,
            1,
            ease_out_cubic(interval_progress(progress, 0.62, 0.9)),
        )
    face_y = interpolate_value(
        0,
        -2,
        ease_in_out_sine(interval_progress(progress, 0.24, 0.58)),
    )
    face_y = interpolate_value(
        face_y,
        0,
        ease_out_cubic(interval_progress(progress, 0.72, 1)),
    )

    rest_opacity = 1 - interval_progress(progress, 0.25, 0.29)
    mid_opacity = opacity_between(progress, 0.25, 0.29, 0.36, 0.4)
    closed_opacity = opacity_between(progress, 0.36, 0.4, 0.48, 0.52)
    grin_opacity = interval_progress(progress, 0.48, 0.54)

    composite_layer(
        output,
        rest_face,
        opacity=rest_opacity,
        scale=interpolate_value(1, 0.992, ease_in_out_sine(interval_progress(progress, 0, 0.18))),
        translate=(0, interpolate_value(0, 1, ease_in_out_sine(interval_progress(progress, 0, 0.18)))),
    )
    composite_layer(
        output,
        mid_face,
        opacity=mid_opacity,
        scale=interpolate_value(0.985, 1.012, eased_progress),
        translate=(0, face_y),
    )
    composite_layer(
        output,
        closed_face,
        opacity=closed_opacity,
        scale=interpolate_value(0.99, 1.018, eased_progress),
        translate=(0, face_y),
    )
    composite_layer(
        output,
        grin_face,
        opacity=grin_opacity,
        scale=face_scale,
        translate=(0, face_y),
    )

    hand_intro = ease_out_cubic(interval_progress(progress, 0.08, 0.68))
    hand_settle = ease_out_back(interval_progress(progress, 0.62, 0.86), 1.65)
    hand_opacity = interval_progress(progress, 0.08, 0.24)
    hand_x = interpolate_value(-92, -12, hand_intro)
    hand_y = interpolate_value(52, 4, hand_intro)
    hand_rotate = interpolate_value(-23, -5, hand_intro)
    hand_scale = interpolate_value(0.64, 0.98, hand_intro)

    if progress >= 0.62:
        hand_x = interpolate_value(-10, 2, min(hand_settle, 1.08))
        hand_y = interpolate_value(4, -8, min(hand_settle, 1.05))
        hand_rotate = interpolate_value(-5, 5, min(hand_settle, 1.08))
        hand_scale = interpolate_value(0.98, 1.075, min(hand_settle, 1.06))

    if progress >= 0.86:
        final = ease_out_cubic(interval_progress(progress, 0.86, 1))
        hand_x = interpolate_value(hand_x, 0, final)
        hand_y = interpolate_value(hand_y, 0, final)
        hand_rotate = interpolate_value(hand_rotate, 0, final)
        hand_scale = interpolate_value(hand_scale, 1, final)

    composite_layer(
        output,
        hand,
        opacity=hand_opacity,
        scale=hand_scale,
        rotate=hand_rotate,
        translate=(hand_x, hand_y),
    )

    sparkle_progress = interval_progress(progress, 0.78, 0.93)
    sparkle_opacity = interval_progress(progress, 0.78, 0.87)
    sparkle_scale = interpolate_value(
        0.48,
        1.18,
        min(ease_out_back(sparkle_progress, 1.9), 1.12),
    )
    sparkle_scale = interpolate_value(
        sparkle_scale,
        1,
        ease_out_cubic(interval_progress(progress, 0.92, 1)),
    )
    sparkle_rotate = interpolate_value(-10, 6, sparkle_progress)
    sparkle_rotate = interpolate_value(
        sparkle_rotate,
        0,
        ease_out_cubic(interval_progress(progress, 0.92, 1)),
    )

    composite_layer(
        output,
        sparkle,
        opacity=sparkle_opacity,
        scale=sparkle_scale,
        rotate=sparkle_rotate,
    )

    return output


def build_smooth_sprite_sheet():
    SMOOTH_DIR.mkdir(parents=True, exist_ok=True)
    rest_face = Image.open(LAYER_DIR / "face_rest.png").convert("RGBA")
    mid_face = Image.open(LAYER_DIR / "face_mid.png").convert("RGBA")
    closed_face = Image.open(LAYER_DIR / "face_closed.png").convert("RGBA")
    grin_face = Image.open(LAYER_DIR / "face_grin.png").convert("RGBA")
    hand = Image.open(LAYER_DIR / "hand.png").convert("RGBA")
    sparkle = Image.open(LAYER_DIR / "sparkle.png").convert("RGBA")
    rows = math.ceil(SPRITE_FRAME_COUNT / SPRITE_COLUMNS)
    sheet = Image.new(
        "RGBA",
        (SPRITE_CELL_WIDTH * SPRITE_COLUMNS, SPRITE_CELL_HEIGHT * rows),
        (0, 0, 0, 0),
    )

    for frame_index in range(SPRITE_FRAME_COUNT):
        progress = frame_index / (SPRITE_FRAME_COUNT - 1)
        frame = build_layered_sprite_frame(
            progress,
            rest_face,
            mid_face,
            closed_face,
            grin_face,
            hand,
            sparkle,
        )
        column = frame_index % SPRITE_COLUMNS
        row = frame_index // SPRITE_COLUMNS

        frame.save(
            SMOOTH_DIR / f"sprite_frame_{frame_index + 1:02d}.png",
            optimize=True,
        )
        sheet.alpha_composite(
            frame,
            (
                column * SPRITE_CELL_WIDTH + SPRITE_CELL_PADDING,
                row * SPRITE_CELL_HEIGHT + SPRITE_CELL_PADDING,
            ),
        )

    sheet.save(SMOOTH_DIR / SPRITE_SHEET_NAME, optimize=True)
    print(f"built {(SMOOTH_DIR / SPRITE_SHEET_NAME).relative_to(Path.cwd())}")


def paste_shifted_layer(output, layer, offset):
    x, y = round(offset[0]), round(offset[1])
    width, height = output.size
    destination_left = max(0, x)
    destination_top = max(0, y)
    source_left = max(0, -x)
    source_top = max(0, -y)
    paste_width = min(width - destination_left, width - source_left)
    paste_height = min(height - destination_top, height - source_top)

    if paste_width <= 0 or paste_height <= 0:
        return

    output.alpha_composite(
        layer.crop(
            (
                source_left,
                source_top,
                source_left + paste_width,
                source_top + paste_height,
            )
        ),
        (destination_left, destination_top),
    )


def shifted_masked_layer(image, mask, offset):
    alpha = ImageChops.multiply(mask, image.getchannel("A"))
    layer = image.copy()
    output = Image.new("RGBA", image.size, (0, 0, 0, 0))

    layer.putalpha(alpha)
    paste_shifted_layer(output, layer, offset)

    return output


def face_center_for_frame(frame_name):
    bbox = face_bbox(load_clean_frame(frame_name))

    if bbox is None:
        return (SPRITE_WIDTH / 2, SPRITE_HEIGHT / 2)

    min_x, min_y, max_x, max_y = bbox

    return ((min_x + max_x) / 2, (min_y + max_y) / 2)


def build_hand_mask(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    bbox = face_bbox(rgba)
    face_center_x = width * 0.5 if bbox is None else (bbox[0] + bbox[2]) / 2
    face_top = height * 0.22 if bbox is None else bbox[1]
    face_bottom = height * 0.68 if bbox is None else bbox[3]
    seed = bytearray(width * height)

    for y in range(height):
        for x in range(width):
            r, g, b, a = rgba.getpixel((x, y))

            is_glove = (
                a > 16
                and r > 124
                and g > 116
                and b > 132
                and max(r, g, b) - min(r, g, b) < 72
            )
            left_of_face = x < face_center_x - 20
            plausible_hand_y = y > face_top + 24
            above_shadow = y < face_bottom + 62

            if is_glove and left_of_face and plausible_hand_y and above_shadow:
                seed[y * width + x] = 1

    def keep_hand_component(component, component_bbox):
        min_x, min_y, max_x, max_y = component_bbox
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2

        return (
            len(component) >= 42
            and center_x < face_center_x - 54
            and center_y > face_top + 58
            and max_y - min_y > 8
            and max_x < face_center_x - 36
            and min_y < face_bottom + 32
        )

    mask = component_filtered_mask(seed, width, height, keep_hand_component)
    mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))

    return mask.filter(ImageFilter.GaussianBlur(0.65))


def build_sparkle_mask(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    bbox = face_bbox(rgba)
    face_left = width * 0.18 if bbox is None else bbox[0]
    face_right = width * 0.92 if bbox is None else bbox[2]
    face_top = height * 0.12 if bbox is None else bbox[1]
    face_bottom = height * 0.62 if bbox is None else bbox[3]
    seed = bytearray(width * height)

    for y in range(height):
        for x in range(width):
            r, g, b, a = rgba.getpixel((x, y))

            in_upper_sparkle_zone = (
                face_left - 52 < x < face_right + 30
                and face_top - 12 < y < face_top + 72
            )
            in_tooth_flash_zone = (
                face_right - 96 < x < face_right - 36
                and face_bottom - 92 < y < face_bottom - 48
            )
            is_gold_sparkle = a > 18 and r > 205 and g > 150 and b < 130
            is_white_flash = (
                a > 18
                and r > 232
                and g > 226
                and b > 184
                and abs(r - g) < 35
            )

            if (in_upper_sparkle_zone and is_gold_sparkle) or (
                in_tooth_flash_zone and is_white_flash
            ):
                seed[y * width + x] = 1

    def keep_sparkle_component(component, component_bbox):
        min_x, min_y, max_x, max_y = component_bbox
        component_width = max_x - min_x
        component_height = max_y - min_y
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        in_sparkle_zone = (
            face_left - 52 < center_x < face_right + 30
            and face_top - 12 < center_y < face_top + 72
        )
        in_flash_zone = (
            face_right - 96 < center_x < face_right - 36
            and face_bottom - 92 < center_y < face_bottom - 48
        )
        is_tiny_accent = len(component) <= 160
        is_star_sized = component_width <= width * 0.13 and component_height <= height * 0.09

        return (
            3 <= len(component) <= 900
            and component_width <= width * 0.18
            and component_height <= height * 0.13
            and ((in_sparkle_zone and is_tiny_accent) or (in_flash_zone and is_star_sized))
        )

    mask = component_filtered_mask(seed, width, height, keep_sparkle_component)
    mask = mask.filter(ImageFilter.MaxFilter(3))

    return mask.filter(ImageFilter.GaussianBlur(0.35))


def build_animated_layers():
    LAYER_DIR.mkdir(parents=True, exist_ok=True)
    target_center = face_center_for_frame(ANIMATED_LAYER_SOURCES["face_rest.png"])

    for output_name, frame_name in ANIMATED_LAYER_SOURCES.items():
        image = load_clean_frame(frame_name)
        source_center = face_center_for_frame(frame_name)
        offset = (
            target_center[0] - source_center[0],
            target_center[1] - source_center[1],
        )

        if output_name.startswith("face_"):
            mask = build_face_plus_shadow_mask(image)
        elif output_name == "hand.png":
            mask = build_hand_mask(image)
        elif output_name == "sparkle.png":
            mask = build_sparkle_mask(image)
        else:
            mask = image.getchannel("A")

        layer = shifted_masked_layer(image, mask, offset)
        layer.save(LAYER_DIR / output_name, optimize=True)
        print(f"built {(LAYER_DIR / output_name).relative_to(Path.cwd())}")


def main():
    CLEANED_DIR.mkdir(parents=True, exist_ok=True)

    for frame_name in FRAME_NAMES:
        clean_frame(frame_name)

    build_animated_layers()
    build_smooth_sprite_sheet()


if __name__ == "__main__":
    main()
