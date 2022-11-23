from abc import ABCMeta, abstractmethod
from collections.abc import Mapping, MutableMapping, Sequence
import re


class Attr(Mapping, metaclass=ABCMeta):

    @abstractmethod
    def _configuration(self) -> None:
        pass

    @classmethod
    def _constructor(cls) -> None:
        raise NotImplementedError("You need to implement this")

    def __call__(self, key: str) -> Mapping:
        if key not in self:
            raise AttributeError(
                "'%s instance has no attribute '%s'" % (self.__class__.__name__, key)
            )

        return self._build(self[key])

    def __getattr__(self, key: str) -> Mapping:
        if key not in self or not self._valid_name(key):
            raise AttributeError(
                "'%s' instance has no attribute '%s'" % (self.__class__.__name__, key)
            )

        return self._build(self[key])

    def _build(self, obj: Mapping) -> Mapping:
        if isinstance(obj, Mapping):
            obj = self._constructor(obj, self._configuration())
        elif (isinstance(obj, Sequence) and not isinstance(obj, (str, bytes))):
            sequence_type = getattr(self, "_sequence_type", None)

            if sequence_type:
                obj = sequence_type(self._build(element) for element in obj)

        return obj

    @classmethod
    def _valid_name(cls, key: str) -> bool:
        return (isinstance(key, str)
            and re.match(r"^[A-Za-z][A-Za-z0-9_]*$", key)
            and not hasattr(cls, key)
        )


class MutableAttr(Attr, MutableMapping, metaclass=ABCMeta):

    def _setattr(self, key, value) -> None:
        super(MutableAttr, self).__setattr__(key, value)

    def __setattr__(self, key, value) -> None:
        if self._valid_name(key):
            self[key] = value
        elif getattr(self, "_allow_invalid_attributes", True):
            super(MutableAttr, self).__setattr__(key, value)
        else:
            raise TypeError(f"'{self.__class__.__name__}' does not allow attribute creation.")


class AttrDict(dict, MutableAttr):

    def __init__(self, *args, **kwargs) -> None:
        super(AttrDict, self).__init__(*args, **kwargs)

        self._setattr("_sequence_type", tuple)
        self._setattr("_allow_invalid_attributes", False)

    def _configuration(self) -> type:
        return self._sequence_type

    def __getstate__(self) -> tuple:
        return (
            self.copy(),
            self._sequence_type,
            self._allow_invalid_attributes
        )

    @classmethod
    def _constructor(cls, mapping, configuration) -> Mapping:
        attr = cls(mapping)
        attr._setattr("_sequence_type", configuration)
        return attr
