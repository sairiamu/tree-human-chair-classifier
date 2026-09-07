"""Print what this machine can actually do before you build anything."""

import adaptshot


def main() -> None:
    print(adaptshot.check_environment())


if __name__ == "__main__":
    main()